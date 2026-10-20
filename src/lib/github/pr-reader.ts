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
}

export class GitHubPRReader {
  private static readonly MAX_DIFF_BYTES = 100 * 1024; // 100 KB
  private static readonly MAX_FILES = 20;

  /**
   * Parse and validate a GitHub Pull Request URL
   */
  public static parsePRUrl(url: string): { owner: string; repo: string; pullNumber: number } {
    const cleanUrl = url.trim();
    const regex = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)\/?$/;
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
   * Fetch public PR metadata and diff from GitHub REST API (read-only)
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
        throw new Error(`GitHub PR not found: ${owner}/${repo}#${pullNumber} (check if repo is public)`);
      }
      if (prResponse.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again shortly.');
      }
      throw new Error(`Failed to fetch PR from GitHub (${prResponse.status})`);
    }

    const prData = await prResponse.json();

    // 2. Fetch Changed Files
    const filesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=30`;
    const filesResponse = await fetch(filesUrl, { headers });
    let changedFiles: string[] = [];

    if (filesResponse.ok) {
      const filesData = await filesResponse.json();
      changedFiles = (filesData || []).map((f: any) => f.filename);
      if (changedFiles.length > this.MAX_FILES) {
        throw new Error(
          `PR has ${changedFiles.length} files. Exceeds MVP review scope (maximum ${this.MAX_FILES} files allowed).`
        );
      }
    }

    // 3. Fetch Diff
    const diffHeaders = {
      ...headers,
      Accept: 'application/vnd.github.v3.diff',
    };
    const diffResponse = await fetch(prUrl, { headers: diffHeaders });
    let diff = '';

    if (diffResponse.ok) {
      diff = await diffResponse.text();
      if (diff.length > this.MAX_DIFF_BYTES) {
        throw new Error(
          `PR diff size (${Math.round(diff.length / 1024)} KB) exceeds safety limit of 100 KB.`
        );
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
      changedFiles,
      diff,
    };
  }
}
