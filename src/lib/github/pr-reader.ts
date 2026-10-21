/**
 * FlowGuard AI — Read-Only Public GitHub PR Reader & Coverage Analyzer
 *
 * Implements hardened PR fetching, unified diff parsing, per-file patch filtering,
 * clean patch boundary enforcement, and structured coverage metadata.
 */

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.java', '.kt', '.cs', '.cpp', '.c', '.h',
  '.rb', '.rs', '.php', '.swift', '.scala', '.sh',
]);

const NON_CODE_EXTENSIONS = new Set([
  '.md', '.mdx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.pdf', '.csv', '.json', '.yaml', '.yml', '.lock', '.toml',
]);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.avif',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.wasm', '.bin', '.exe', '.dll', '.so', '.dylib',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.mov', '.avi', '.webm',
]);

export function fileScore(filename: string): number {
  const lower = filename.toLowerCase();
  const ext = lower.includes('.') ? '.' + lower.split('.').pop() : '';
  if (CODE_EXTENSIONS.has(ext)) return 10;
  if (lower.includes('test') || lower.includes('spec')) return 8;
  if (lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml')) return 5;
  if (NON_CODE_EXTENSIONS.has(ext)) return 1;
  return 6; // unknown ext — assume code
}

export function isBinaryFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  const ext = lower.includes('.') ? '.' + lower.split('.').pop() : '';
  return BINARY_EXTENSIONS.has(ext);
}

export interface PRCoverageMetadata {
  totalFiles: number;
  analyzedFiles: number;
  selectedFiles: number;
  filesWithPatch: number;
  skippedFiles: number;
  isPartialAnalysis: boolean;
  selectionStrategy: string;
  incompleteReason?: string;
  skippedFileNames?: string[];
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

export interface GitHubPRFileInfo {
  filename: string;
  status?: string;
  previous_filename?: string;
  previousFilename?: string;
  patch?: string;
  additions?: number;
  deletions?: number;
  changes?: number;
}

export interface ParsedFileDiff {
  filename: string;
  oldFilename?: string;
  patch: string;
  isBinary: boolean;
  status: 'added' | 'removed' | 'modified' | 'renamed';
}

export class GitHubPRReader {
  /** Soft limit: analyse up to this many files; beyond -> partial analysis */
  public static readonly MAX_ANALYSED_FILES = 30;
  /** Hard absolute ceiling for pagination safety */
  public static readonly MAX_TOTAL_FILES = 300;
  /** Diff size limit: 200 KB */
  public static readonly MAX_DIFF_BYTES = 200 * 1024;
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
   * Parse a unified diff text into individual per-file diff blocks.
   * Handles git diff headers, rename metadata, binary file indicators, and standard hunks.
   */
  public static parseUnifiedDiff(rawDiff: string): Map<string, ParsedFileDiff> {
    const fileDiffs = new Map<string, ParsedFileDiff>();
    if (!rawDiff || rawDiff.trim().length === 0) return fileDiffs;

    const lines = rawDiff.split(/\r?\n/);
    let currentFile: {
      filename: string;
      oldFilename?: string;
      lines: string[];
      isBinary: boolean;
      status: 'added' | 'removed' | 'modified' | 'renamed';
    } | null = null;

    const commitCurrent = () => {
      if (!currentFile || !currentFile.filename) return;
      const patch = currentFile.lines.join('\n');
      const parsed: ParsedFileDiff = {
        filename: currentFile.filename,
        oldFilename: currentFile.oldFilename,
        patch,
        isBinary: currentFile.isBinary,
        status: currentFile.status,
      };
      fileDiffs.set(currentFile.filename, parsed);
      if (currentFile.oldFilename && currentFile.oldFilename !== currentFile.filename) {
        fileDiffs.set(currentFile.oldFilename, parsed);
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for "diff --git a/<old> b/<new>"
      const gitDiffMatch = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
      if (gitDiffMatch) {
        commitCurrent();
        currentFile = {
          oldFilename: gitDiffMatch[1],
          filename: gitDiffMatch[2],
          lines: [line],
          isBinary: isBinaryFile(gitDiffMatch[2]),
          status: 'modified',
        };
        continue;
      }

      // Check for unified diff header without "diff --git"
      if (!currentFile && line.match(/^--- (?:a\/)?([^\t\r\n]+)/)) {
        const oldMatch = line.match(/^--- (?:a\/)?([^\t\r\n]+)/);
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const newMatch = nextLine.match(/^\+\+\+ (?:b\/)?([^\t\r\n]+)/);
        if (oldMatch && newMatch) {
          const oldPath = oldMatch[1] === '/dev/null' ? undefined : oldMatch[1];
          const newPath = newMatch[1] === '/dev/null' ? oldPath : newMatch[1];
          const filename = newPath || oldPath || 'unknown';
          currentFile = {
            oldFilename: oldPath,
            filename,
            lines: [line, nextLine],
            isBinary: isBinaryFile(filename),
            status:
              oldMatch[1] === '/dev/null'
                ? 'added'
                : newMatch[1] === '/dev/null'
                ? 'removed'
                : 'modified',
          };
          i++; // skip nextLine
          continue;
        }
      }

      if (currentFile) {
        currentFile.lines.push(line);

        if (/^rename from (.+)$/.test(line)) {
          currentFile.oldFilename = line.match(/^rename from (.+)$/)![1].trim();
          currentFile.status = 'renamed';
        } else if (/^rename to (.+)$/.test(line)) {
          currentFile.filename = line.match(/^rename to (.+)$/)![1].trim();
          currentFile.status = 'renamed';
        } else if (/^new file mode/.test(line)) {
          currentFile.status = 'added';
        } else if (/^deleted file mode/.test(line)) {
          currentFile.status = 'removed';
        } else if (/Binary files .* differ/i.test(line) || /GIT binary patch/i.test(line)) {
          currentFile.isBinary = true;
        }
      }
    }

    commitCurrent();
    return fileDiffs;
  }

  /**
   * Format a per-file patch into standard unified diff with headers.
   */
  public static formatFilePatch(
    filename: string,
    patch: string,
    previousFilename?: string,
    status?: string
  ): string {
    const oldPath = previousFilename || filename;
    const newPath = filename;
    const aPrefix = status === 'added' ? '/dev/null' : `a/${oldPath}`;
    const bPrefix = status === 'removed' ? '/dev/null' : `b/${newPath}`;
    let header = `diff --git a/${oldPath} b/${newPath}\n`;
    if (status === 'renamed' && previousFilename && previousFilename !== filename) {
      header += `rename from ${previousFilename}\nrename to ${filename}\n`;
    }
    header += `--- ${aPrefix}\n+++ ${bPrefix}\n`;

    // If the patch already contains diff --git or ---/+++ headers, return as is
    if (patch.startsWith('diff --git') || (patch.includes('--- ') && patch.includes('+++ '))) {
      return patch.trimEnd() + '\n';
    }

    return header + patch.trimEnd() + '\n';
  }

  /**
   * Fetch changed files from a public PR using pagination.
   * Capped at MAX_TOTAL_FILES to protect against runaway resource consumption.
   */
  private static async fetchAllFiles(
    owner: string,
    repo: string,
    pullNumber: number,
    headers: Record<string, string>
  ): Promise<{
    files: GitHubPRFileInfo[];
    paginationIncomplete: boolean;
    paginationCapped: boolean;
    error?: string;
  }> {
    const allFiles: GitHubPRFileInfo[] = [];
    let page = 1;
    let paginationIncomplete = false;
    let paginationCapped = false;
    let error: string | undefined = undefined;

    while (true) {
      const url =
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files` +
        `?per_page=${this.PAGE_SIZE}&page=${page}`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        if (page === 1) {
          if (res.status === 403) {
            throw new Error('GitHub API rate limit exceeded while fetching changed files.');
          }
          if (res.status === 404) {
            throw new Error(
              `GitHub PR not found: ${owner}/${repo}#${pullNumber} (check if repo is public)`
            );
          }
          throw new Error(`Failed to fetch changed files from GitHub (HTTP ${res.status})`);
        }
        // Failure on subsequent page: we have partial files from earlier pages
        paginationIncomplete = true;
        error = `pagination_failed_at_page_${page}_http_${res.status}`;
        break;
      }

      const data = (await res.json()) as GitHubPRFileInfo[];
      if (!Array.isArray(data) || data.length === 0) break;

      for (const f of data) {
        if (allFiles.length >= this.MAX_TOTAL_FILES) {
          paginationCapped = true;
          break;
        }
        allFiles.push({
          filename: f.filename,
          status: f.status,
          previousFilename: f.previous_filename,
          patch: typeof f.patch === 'string' ? f.patch : undefined,
          additions: typeof f.additions === 'number' ? f.additions : undefined,
          deletions: typeof f.deletions === 'number' ? f.deletions : undefined,
          changes: typeof f.changes === 'number' ? f.changes : undefined,
        });
      }

      if (data.length < this.PAGE_SIZE || allFiles.length >= this.MAX_TOTAL_FILES) {
        if (allFiles.length >= this.MAX_TOTAL_FILES && data.length >= this.PAGE_SIZE) {
          paginationCapped = true;
        }
        break;
      }
      page++;
    }

    return { files: allFiles, paginationIncomplete, paginationCapped, error };
  }

  /**
   * Select the most relevant files for analysis when the PR is large.
   * Prioritises source-code files over documentation and assets.
   */
  public static selectFiles(allFiles: GitHubPRFileInfo[]): {
    selected: GitHubPRFileInfo[];
    skipped: GitHubPRFileInfo[];
    strategy: string;
  } {
    if (allFiles.length <= this.MAX_ANALYSED_FILES) {
      return {
        selected: allFiles,
        skipped: [],
        strategy: 'full',
      };
    }

    const scored = allFiles.map((f) => ({ file: f, score: fileScore(f.filename) }));
    scored.sort((a, b) => b.score - a.score || a.file.filename.localeCompare(b.file.filename));

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
   * Ensures Risk Hunter only receives real patches for selected files.
   * Strictly enforces patch integrity and structured coverage metadata.
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

    // 2. Fetch all changed files (paginated, up to MAX_TOTAL_FILES)
    const {
      files: allFiles,
      paginationIncomplete,
      paginationCapped,
      error: paginationError,
    } = await this.fetchAllFiles(owner, repo, pullNumber, headers);

    const trueTotalFiles =
      typeof prData.changed_files === 'number' && prData.changed_files > 0
        ? Math.max(prData.changed_files, allFiles.length)
        : allFiles.length;

    if (trueTotalFiles === 0 && allFiles.length === 0) {
      throw new Error(`GitHub PR ${owner}/${repo}#${pullNumber} has no changed files to analyze.`);
    }

    // 3. Select files for analysis (partial if PR is large)
    const { selected, skipped, strategy } = this.selectFiles(allFiles);

    // 4. Fetch unified diff if needed for files lacking inline patch or verification
    const needsUnifiedDiff =
      selected.length === 0 ||
      selected.some((f) => !f.patch && !isBinaryFile(f.filename)) ||
      selected.every((f) => !f.patch);

    let parsedDiffMap = new Map<string, ParsedFileDiff>();

    if (needsUnifiedDiff) {
      const diffHeaders = { ...headers, Accept: 'application/vnd.github.v3.diff' };
      const diffResponse = await fetch(prUrl, { headers: diffHeaders });

      if (diffResponse.ok) {
        const fullDiff = await diffResponse.text();
        parsedDiffMap = this.parseUnifiedDiff(fullDiff);
      } else if (diffResponse.status === 403) {
        throw new Error('GitHub API rate limit exceeded while fetching diff.');
      }
    }

    // 5. Assemble diff strictly for selected files, preserving patch boundaries
    let diff = '';
    let filesWithPatch = 0;
    let diffLimitReached = false;
    const omittedDueToSize: string[] = [];
    const missingPatches: string[] = [];

    for (const file of selected) {
      if (isBinaryFile(file.filename)) {
        missingPatches.push(file.filename);
        continue;
      }

      // Obtain patch from inline patch or parsed unified diff
      let filePatch = '';
      if (file.patch && file.patch.trim().length > 0) {
        filePatch = this.formatFilePatch(
          file.filename,
          file.patch,
          file.previousFilename,
          file.status
        );
      } else {
        const parsed =
          parsedDiffMap.get(file.filename) ||
          (file.previousFilename ? parsedDiffMap.get(file.previousFilename) : undefined);
        if (parsed) {
          if (parsed.isBinary) {
            missingPatches.push(file.filename);
            continue;
          }
          if (parsed.patch && parsed.patch.trim().length > 0) {
            filePatch = parsed.patch.trimEnd() + '\n';
          }
        }
      }

      if (!filePatch || filePatch.trim().length === 0) {
        missingPatches.push(file.filename);
        continue;
      }

      // Check diff byte limit (200 KB)
      if (diff.length + filePatch.length > this.MAX_DIFF_BYTES) {
        if (diff.length === 0) {
          // A single file patch exceeds 200 KB — truncate at clean line boundary
          const lastNl = filePatch.lastIndexOf('\n', this.MAX_DIFF_BYTES);
          const safeCut = lastNl > 0 ? lastNl : this.MAX_DIFF_BYTES;
          diff =
            filePatch.slice(0, safeCut) +
            '\n# [FLOWGUARD NOTICE: Single file patch exceeded 200 KB and was truncated at line boundary. Incomplete evidence. Remaining diff truncated at 200 KB limit.]\n';
          filesWithPatch++;
          diffLimitReached = true;
          omittedDueToSize.push(file.filename);
        } else {
          diffLimitReached = true;
          omittedDueToSize.push(file.filename);
        }
        continue;
      }

      diff += filePatch + '\n';
      filesWithPatch++;
    }

    if (diffLimitReached && omittedDueToSize.length > 0 && !diff.includes('truncated')) {
      diff += `\n# [FLOWGUARD NOTICE: Diff size limit (200 KB) reached. ${omittedDueToSize.length} selected file patch(es) omitted to preserve patch integrity. Remaining diff truncated at 200 KB limit.]\n`;
    }

    // 6. Fail honestly if no code evidence could be obtained
    if (filesWithPatch === 0 || diff.trim().length === 0) {
      throw new Error(
        `GitHub PR ${owner}/${repo}#${pullNumber} contains no readable code patches or diff evidence for analysis. ` +
        `Found ${trueTotalFiles} file(s), but 0 patches could be verified (binary, empty, or missing). ` +
        `Analysis cannot proceed without valid code patches.`
      );
    }

    // 7. Structured coverage metadata
    const skippedCount = trueTotalFiles - selected.length;
    const reasons: string[] = [];

    if (skippedCount > 0) {
      reasons.push('pr_file_count_exceeds_analysis_limit');
    }
    if (diffLimitReached) {
      reasons.push('diff_size_limit_exceeded');
    }
    if (missingPatches.length > 0) {
      reasons.push('binary_or_missing_patch');
    }
    if (paginationCapped) {
      reasons.push('pagination_capped_at_300_files');
    }
    if (paginationIncomplete) {
      reasons.push(paginationError || 'pagination_incomplete_api_error');
    }

    const incompleteReason = reasons.length > 0 ? reasons.join('; ') : undefined;
    const isPartialAnalysis =
      skippedCount > 0 ||
      filesWithPatch < selected.length ||
      Boolean(incompleteReason);

    const coverage: PRCoverageMetadata = {
      totalFiles: trueTotalFiles,
      analyzedFiles: selected.length,
      selectedFiles: selected.length,
      filesWithPatch,
      skippedFiles: skippedCount,
      isPartialAnalysis,
      selectionStrategy: strategy,
      incompleteReason,
      skippedFileNames: skipped.map((s) => s.filename),
    };

    return {
      owner,
      repo,
      pullNumber,
      title: prData.title || '',
      description: prData.body || '',
      headSha: prData.head?.sha || 'unknown',
      baseBranch: prData.base?.ref || 'main',
      changedFiles: selected.map((s) => s.filename),
      diff,
      coverage,
    };
  }
}
