/** Priority score helpers for partial-analysis file selection */
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.java', '.kt', '.cs', '.cpp', '.c', '.h',
  '.rb', '.rs', '.php', '.swift', '.scala', '.sh',
]);

const NON_CODE_EXTENSIONS = new Set([
  '.md', '.mdx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.pdf', '.csv', '.json', '.yaml', '.yml', '.lock', '.toml',
]);

function fileScore(filename: string): number {
  const lower = filename.toLowerCase();
  const ext = lower.includes('.') ? '.' + lower.split('.').pop() : '';
  if (CODE_EXTENSIONS.has(ext)) return 10;
  if (lower.includes('test') || lower.includes('spec')) return 8;
  if (lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml')) return 5;
  if (NON_CODE_EXTENSIONS.has(ext)) return 1;
  return 6; // unknown ext — assume code
}

export interface PRCoverageMetadata {
  totalFiles: number;
  analyzedFiles: number;
  skippedFiles: number;
  isPartialAnalysis: boolean;
  selectionStrategy: string;
}

export interface GitHubPRMetadata {
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  description: string;
  headSha: string;
  baseBranch: string;
  changedFiles: string[];
  diff: string;
  coverage: PRCoverageMetadata;
}

export class GitHubPRReader {
  /** Soft limit: analyse up to this many files; beyond → partial analysis */
  private static readonly MAX_ANALYSED_FILES = 30;
  /** Hard absolute ceiling for pagination safety */
  private static readonly MAX_TOTAL_FILES = 300;
  /** Diff size limit: 200 KB */
  private static readonly MAX_DIFF_BYTES = 200 * 1024;
  /** GitHub API page size */
  private static readonly PAGE_SIZE = 100;

  /**
   * Parse and validate a GitHub Pull Request URL.
   */
  public static parsePRUrl(url: string): { owner: string; repo: string; pullNumber: number } {
    const cleanUrl = url.trim();
    const regex =
      /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)\/?$/;
    const match = cleanUrl.match(regex);

    if (!match) {
      throw new Error(
        'Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number'
      );
    }

    return {
      owner: match[1],
      repo: match[2],
      pullNumber: parseInt(match[3], 10),
    };
  }

  /**
   * Fetch all changed file names from a public PR using pagination.
   * Stops early once MAX_TOTAL_FILES is reached to avoid runaway requests.
   */
  private static async fetchAllFiles(
    owner: string,
    repo: string,
    pullNumber: number,
    headers: Record<string, string>
  ): Promise<string[]> {
    const allFiles: string[] = [];
    let page = 1;

    while (true) {
      const url =
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files` +
        `?per_page=${this.PAGE_SIZE}&page=${page}`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        // Non-fatal: return what we have
        break;
      }

      const data: Array<{ filename: string }> = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const f of data) {
        if (allFiles.length >= this.MAX_TOTAL_FILES) break;
        allFiles.push(f.filename);
      }

      // GitHub returns fewer than PAGE_SIZE items on the last page
      if (data.length < this.PAGE_SIZE || allFiles.length >= this.MAX_TOTAL_FILES) break;
      page++;
    }

    return allFiles;
  }

  /**
   * Select the most relevant files for analysis when the PR is too large.
   * Prioritises source-code files over documentation and assets.
   */
  private static selectFiles(allFiles: string[]): {
    selected: string[];
    skipped: string[];
    strategy: string;
  } {
    if (allFiles.length <= this.MAX_ANALYSED_FILES) {
      return {
        selected: allFiles,
        skipped: [],
        strategy: 'full',
      };
    }

    const scored = allFiles.map((f) => ({ file: f, score: fileScore(f) }));
    scored.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

    const selected = scored.slice(0, this.MAX_ANALYSED_FILES).map((s) => s.file);
    const skipped = scored.slice(this.MAX_ANALYSED_FILES).map((s) => s.file);

    return {
      selected,
      skipped,
      strategy: `partial:top-${this.MAX_ANALYSED_FILES}-by-relevance`,
    };
  }

  /**
   * Fetch public PR metadata and diff from GitHub REST API (read-only).
   * Supports PRs with more than 20 files via transparent partial analysis.
   */
  public static async fetchPR(url: string): Promise<GitHubPRMetadata> {
    const { owner, repo, pullNumber } = this.parsePRUrl(url);

    const headers: Record<string, string> = {
      'User-Agent': 'FlowGuard-AI-Auditor/1.0',
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_READ_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_READ_TOKEN}`;
    }

    // 1. Fetch PR details
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
    const prResponse = await fetch(prUrl, { headers });

    if (!prResponse.ok) {
      if (prResponse.status === 404) {
        throw new Error(
          `GitHub PR not found: ${owner}/${repo}#${pullNumber} (check if repo is public)`
        );
      }
      if (prResponse.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again shortly.');
      }
      throw new Error(`Failed to fetch PR from GitHub (${prResponse.status})`);
    }

    const prData = await prResponse.json();

    // 2. Fetch all changed files (paginated)
    const allFiles = await this.fetchAllFiles(owner, repo, pullNumber, headers);

    // 3. Select files for analysis (partial if PR is large)
    const { selected, skipped, strategy } = this.selectFiles(allFiles);

    const coverage: PRCoverageMetadata = {
      totalFiles: allFiles.length,
      analyzedFiles: selected.length,
      skippedFiles: skipped.length,
      isPartialAnalysis: skipped.length > 0,
      selectionStrategy: strategy,
    };

    // 4. Fetch unified diff
    const diffHeaders = { ...headers, Accept: 'application/vnd.github.v3.diff' };
    const diffResponse = await fetch(prUrl, { headers: diffHeaders });
    let diff = '';

    if (diffResponse.ok) {
      const fullDiff = await diffResponse.text();
      if (fullDiff.length > this.MAX_DIFF_BYTES) {
        // Truncate gracefully — do not throw
        diff = fullDiff.slice(0, this.MAX_DIFF_BYTES);
        // Append a truncation notice as a diff comment so agents are aware
        diff += '\n\\ Diff truncated at 200 KB limit. Remaining changes not shown.\n';
      } else {
        diff = fullDiff;
      }
    }

    return {
      owner,
      repo,
      pullNumber,
      title: prData.title || '',
      description: prData.body || '',
      headSha: prData.head?.sha || 'unknown',
      baseBranch: prData.base?.ref || 'main',
      changedFiles: selected,
      diff,
      coverage,
    };
  }
}
