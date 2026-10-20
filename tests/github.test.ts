import { describe, it, expect, vi, afterEach } from 'vitest';
import { GitHubPRReader } from '../src/lib/github/pr-reader';
import { RiskHunterAgent } from '../src/lib/agents/risk-agent';
import { BusinessInvariant } from '../src/lib/schemas/agent-schemas';

// ─── URL Parsing ───────────────────────────────────────────────────────────────

describe('GitHubPRReader.parsePRUrl', () => {
  it('parses valid public GitHub PR URLs accurately', () => {
    const parsed = GitHubPRReader.parsePRUrl(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );
    expect(parsed.owner).toBe('allfridhosaragii');
    expect(parsed.repo).toBe('FlowGuard-AI');
    expect(parsed.pullNumber).toBe(1);
  });

  it('parses URLs with trailing slash', () => {
    const parsed = GitHubPRReader.parsePRUrl(
      'https://github.com/org/my-repo/pull/42/'
    );
    expect(parsed.pullNumber).toBe(42);
    expect(parsed.repo).toBe('my-repo');
  });

  it('rejects issue URLs', () => {
    expect(() =>
      GitHubPRReader.parsePRUrl('https://github.com/owner/repo/issues/1')
    ).toThrow(/Invalid GitHub PR URL/);
  });

  it('rejects URLs from other domains', () => {
    expect(() =>
      GitHubPRReader.parsePRUrl('https://malicious-site.com/fake/pull/1')
    ).toThrow(/Invalid GitHub PR URL/);
  });

  it('rejects bare strings', () => {
    expect(() => GitHubPRReader.parsePRUrl('not-a-url')).toThrow(
      /Invalid GitHub PR URL/
    );
  });

  it('rejects empty string', () => {
    expect(() => GitHubPRReader.parsePRUrl('')).toThrow(/Invalid GitHub PR URL/);
  });
});

// ─── Unified Diff Parser ───────────────────────────────────────────────────────

describe('GitHubPRReader.parseUnifiedDiff', () => {
  it('parses multi-file git diffs with hunks, renames, and binary files', () => {
    const rawDiff = `diff --git a/src/service.ts b/src/service.ts
index 1234567..89abcdef 100644
--- a/src/service.ts
+++ b/src/service.ts
@@ -1,3 +1,3 @@
-const oldVal = 1;
+const newVal = 2;
diff --git a/old/path.ts b/new/path.ts
similarity index 98%
rename from old/path.ts
rename to new/path.ts
--- a/old/path.ts
+++ b/new/path.ts
@@ -10,3 +10,4 @@
 unchanged
+added
diff --git a/assets/logo.png b/assets/logo.png
new file mode 100644
Binary files /dev/null and b/assets/logo.png differ
`;

    const parsed = GitHubPRReader.parseUnifiedDiff(rawDiff);

    expect(parsed.has('src/service.ts')).toBe(true);
    expect(parsed.get('src/service.ts')?.patch).toContain('newVal');
    expect(parsed.get('src/service.ts')?.isBinary).toBe(false);

    expect(parsed.has('new/path.ts')).toBe(true);
    expect(parsed.has('old/path.ts')).toBe(true);
    expect(parsed.get('new/path.ts')?.status).toBe('renamed');

    expect(parsed.has('assets/logo.png')).toBe(true);
    expect(parsed.get('assets/logo.png')?.isBinary).toBe(true);
  });
});

// ─── Pagination, Partial Analysis, and Evidence Integrity ──────────────────────

const FAKE_PR_DATA = {
  title: 'Test PR',
  body: 'description',
  head: { sha: 'abc123' },
  base: { ref: 'main' },
  changed_files: 5,
};

const FAKE_DIFF = '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1 +1 @@\n-old\n+new\n';

/** Generate an array of fake file entries with valid patches */
function makeFiles(
  count: number,
  prefix = 'src/file',
  patchFn?: (idx: number) => string
) {
  return Array.from({ length: count }, (_, i) => ({
    filename: `${prefix}${i}.ts`,
    patch: patchFn ? patchFn(i) : `@@ -1,2 +1,2 @@\n-const a${i} = 1;\n+const a${i} = 2;`,
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 2,
  }));
}

describe('GitHubPRReader.fetchPR — pagination & partial analysis', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a small PR (≤30 files) without partial analysis', async () => {
    const files = makeFiles(5);

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => files, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return { ok: true, status: 200, json: async () => ({ ...FAKE_PR_DATA, changed_files: 5 }), text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.isPartialAnalysis).toBe(false);
    expect(pr.coverage.totalFiles).toBe(5);
    expect(pr.coverage.analyzedFiles).toBe(5);
    expect(pr.coverage.selectedFiles).toBe(5);
    expect(pr.coverage.filesWithPatch).toBe(5);
    expect(pr.coverage.skippedFiles).toBe(0);
    expect(pr.coverage.incompleteReason).toBeUndefined();
    expect(pr.changedFiles).toHaveLength(5);
    expect(pr.diff).toContain('src/file0.ts');
    expect(pr.diff).toContain('src/file4.ts');
  });

  it('performs partial analysis for a PR with more than 30 files', async () => {
    const tsFiles = makeFiles(24, 'src/service');
    const mdFiles = Array.from({ length: 20 }, (_, i) => ({
      filename: `docs/doc${i}.md`,
      patch: `@@ -1,2 +1,2 @@\n-# Doc ${i}\n+# Updated Doc ${i}`,
      status: 'modified',
    }));
    const allFiles = [...tsFiles, ...mdFiles];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => allFiles, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 44 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(44);
    expect(pr.coverage.analyzedFiles).toBe(30);
    expect(pr.coverage.selectedFiles).toBe(30);
    expect(pr.coverage.skippedFiles).toBe(14);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.selectionStrategy).toContain('partial');
    expect(pr.coverage.incompleteReason).toContain('pr_file_count_exceeds_analysis_limit');

    // All 24 .ts files fit inside the 30-file cap, so every .ts should be present
    const tsCount = pr.changedFiles.filter((f) => f.endsWith('.ts')).length;
    const mdCount = pr.changedFiles.filter((f) => f.endsWith('.md')).length;
    expect(tsCount).toBe(24);
    expect(mdCount).toBe(6);
  });

  it('REGRESSION: strictly excludes skipped files from Risk Hunter input diff and findings', async () => {
    // 30 code files (selected) + 5 lower priority files (skipped)
    const codeFiles = makeFiles(30, 'src/service');
    // One of the skipped files contains an intentional race vulnerability pattern
    const skippedFiles = [
      {
        filename: 'docs/skipped_vulnerable.md',
        patch: `@@ -10,10 +10,15 @@
+  const existing = await db.find(key);
+  if (!existing) {
+    await sleep(50);
+    await db.insertRefund(key, amount);
+  }`,
        status: 'modified',
      },
      ...Array.from({ length: 4 }, (_, i) => ({
        filename: `docs/guide${i}.md`,
        patch: `@@ -1 +1 @@\n-# Guide\n+# Updated Guide`,
        status: 'modified',
      })),
    ];
    const allFiles = [...codeFiles, ...skippedFiles];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => allFiles, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 35 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    // 1. Assert skipped files are not in changedFiles
    expect(pr.changedFiles).not.toContain('docs/skipped_vulnerable.md');
    expect(pr.changedFiles).toHaveLength(30);

    // 2. Assert skipped file content is NOT in the diff provided to Risk Hunter
    expect(pr.diff).not.toContain('docs/skipped_vulnerable.md');
    expect(pr.diff).not.toContain('insertRefund');

    // 3. Assert Risk Hunter with this diff and changedFiles finds NO risk in the skipped file
    const invariant: BusinessInvariant = {
      id: 'INV-001',
      ruleId: 'RULE-001',
      description: 'At most one refund per idempotency key',
      predicate: 'count(refunds) <= 1',
      severity: 'CRITICAL',
    };
    const riskResult = await RiskHunterAgent.analyze([invariant], pr.diff, pr.changedFiles);
    for (const finding of riskResult.findings) {
      expect(finding.sourcePaths).not.toContain('docs/skipped_vulnerable.md');
    }
  });

  it('uses pagination when a PR has more than 100 files', async () => {
    const page1 = makeFiles(100, 'src/a');
    const page2 = makeFiles(50, 'src/b');

    let fileCallCount = 0;
    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        fileCallCount++;
        if (fileCallCount === 1) {
          return { ok: true, status: 200, json: async () => page1, text: async () => '' };
        } else if (fileCallCount === 2) {
          return { ok: true, status: 200, json: async () => page2, text: async () => '' };
        }
        return { ok: true, status: 200, json: async () => [], text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 150 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(150);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.analyzedFiles).toBeLessThanOrEqual(30);
    expect(fileCallCount).toBe(2);
  });

  it('preserves patch boundaries on oversized diffs and sets incompleteReason', async () => {
    // 3 files whose individual patches total 240 KB > 200 KB limit
    const files = [
      {
        filename: 'src/file0.ts',
        patch: `@@ -1,1 +1,1 @@\n+` + 'a'.repeat(90 * 1024),
        status: 'modified',
      },
      {
        filename: 'src/file1.ts',
        patch: `@@ -1,1 +1,1 @@\n+` + 'b'.repeat(90 * 1024),
        status: 'modified',
      },
      {
        filename: 'src/file2.ts',
        patch: `@@ -1,1 +1,1 @@\n+` + 'c'.repeat(60 * 1024),
        status: 'modified',
      },
    ];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => files, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 3 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    // Diff size must not exceed limit + notice overhead
    expect(pr.diff.length).toBeLessThanOrEqual(200 * 1024 + 500);
    expect(pr.diff).toContain('truncated');
    // First two files fit cleanly intact
    expect(pr.diff).toContain('src/file0.ts');
    expect(pr.diff).toContain('src/file1.ts');
    // File 2 was omitted to preserve patch integrity rather than chopped mid-line
    expect(pr.diff).not.toContain('src/file2.ts');
    expect(pr.coverage.filesWithPatch).toBe(2);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.incompleteReason).toContain('diff_size_limit_exceeded');
  });

  it('handles single oversized file patch by cutting at clean line boundary with notice', async () => {
    // 1 single file whose patch alone is 250 KB
    const giantFile = [
      {
        filename: 'src/giant.ts',
        patch: `@@ -1,1 +1,1 @@\n` + 'const line = 1;\n'.repeat(16 * 1024),
        status: 'modified',
      },
    ];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => giantFile, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 1 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.diff.length).toBeLessThanOrEqual(200 * 1024 + 500);
    expect(pr.diff).toContain('truncated');
    expect(pr.diff).toContain('Single file patch exceeded 200 KB');
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.incompleteReason).toContain('diff_size_limit_exceeded');
  });

  it('handles incomplete pagination gracefully when a subsequent page fails with 500', async () => {
    const page1 = makeFiles(100, 'src/file');
    let callCount = 0;

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        callCount++;
        if (callCount === 1) {
          return { ok: true, status: 200, json: async () => page1, text: async () => '' };
        }
        // Page 2 fails with 500
        return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 150 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(150);
    expect(pr.coverage.analyzedFiles).toBe(30);
    expect(pr.coverage.filesWithPatch).toBe(30);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.incompleteReason).toContain('pagination_failed');
  });

  it('reports true PR totalFiles when PR exceeds 300-file pagination ceiling', async () => {
    // PR reports 450 files total
    const page100 = makeFiles(100, 'src/f');
    let callCount = 0;

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        callCount++;
        return { ok: true, status: 200, json: async () => page100, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 450 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(450); // NOT capped at 300
    expect(pr.coverage.analyzedFiles).toBe(30);
    expect(pr.coverage.skippedFiles).toBe(420);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.incompleteReason).toContain('pagination_capped_at_300_files');
  });

  it('correctly handles renamed files with rename headers and mapped patch', async () => {
    const renamedFile = [
      {
        filename: 'src/new-service.ts',
        previous_filename: 'src/old-service.ts',
        status: 'renamed',
        patch: '@@ -1,2 +1,2 @@\n-const old = true;\n+const renamed = true;',
        changes: 2,
      },
    ];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => renamedFile, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 1 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.changedFiles).toContain('src/new-service.ts');
    expect(pr.diff).toContain('diff --git a/src/old-service.ts b/src/new-service.ts');
    expect(pr.diff).toContain('rename from src/old-service.ts');
    expect(pr.diff).toContain('rename to src/new-service.ts');
    expect(pr.coverage.filesWithPatch).toBe(1);
    expect(pr.coverage.isPartialAnalysis).toBe(false);
  });

  it('identifies binary files and marks partial analysis without feeding binary junk', async () => {
    const files = [
      {
        filename: 'assets/logo.png',
        status: 'added',
        patch: undefined, // binary files have no patch
        changes: 1,
      },
      {
        filename: 'src/auth.ts',
        status: 'modified',
        patch: '@@ -1,2 +1,2 @@\n-authOld();\n+authNew();',
        changes: 2,
      },
    ];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => files, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 2 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.changedFiles).toContain('assets/logo.png');
    expect(pr.changedFiles).toContain('src/auth.ts');
    expect(pr.diff).toContain('src/auth.ts');
    expect(pr.diff).not.toContain('logo.png');
    expect(pr.coverage.analyzedFiles).toBe(2);
    expect(pr.coverage.filesWithPatch).toBe(1); // Only 1 code patch verified
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.incompleteReason).toContain('binary_or_missing_patch');
  });

  it('throws an honest error when ALL files have 0 readable code patches (prevents fake NO_RISK_FOUND)', async () => {
    const onlyBinaryFiles = [
      {
        filename: 'assets/image1.png',
        status: 'added',
        patch: undefined,
        changes: 1,
      },
      {
        filename: 'assets/image2.jpg',
        status: 'added',
        patch: undefined,
        changes: 1,
      },
    ];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => onlyBinaryFiles, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ...FAKE_PR_DATA, changed_files: 2 }),
        text: async () => '',
      };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    await expect(
      GitHubPRReader.fetchPR('https://github.com/allfridhosaragii/FlowGuard-AI/pull/1')
    ).rejects.toThrow(/no readable code patches or diff evidence/i);
  });

  it('surfaces 404 as a descriptive error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => '' }))
    );

    await expect(
      GitHubPRReader.fetchPR('https://github.com/owner/no-such-repo/pull/999')
    ).rejects.toThrow(/not found/i);
  });

  it('surfaces 403 on PR endpoint as a rate-limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403, json: async () => ({}), text: async () => '' }))
    );

    await expect(
      GitHubPRReader.fetchPR('https://github.com/owner/repo/pull/1')
    ).rejects.toThrow(/rate limit/i);
  });

  it('surfaces 403 on file list endpoint as a rate-limit error', async () => {
    const fakeFetch = vi.fn(async (url: string) => {
      if (url.includes('/files')) {
        return { ok: false, status: 403, json: async () => ({}), text: async () => '' };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    await expect(
      GitHubPRReader.fetchPR('https://github.com/owner/repo/pull/1')
    ).rejects.toThrow(/rate limit/i);
  });

  it('throws an honest error when file-list endpoint returns 500 on page 1 (does not proceed blindly)', async () => {
    const fakeFetch = vi.fn(async (url: string) => {
      if (url.includes('/files')) {
        return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    await expect(
      GitHubPRReader.fetchPR('https://github.com/allfridhosaragii/FlowGuard-AI/pull/1')
    ).rejects.toThrow(/Failed to fetch changed files from GitHub \(HTTP 500\)/i);
  });
});
