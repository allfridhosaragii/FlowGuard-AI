import { describe, it, expect, vi, afterEach } from 'vitest';
import { GitHubPRReader } from '../src/lib/github/pr-reader';

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

// ─── Pagination & Partial Analysis (fetchPR – mocked) ─────────────────────────

/** Build a minimal fake fetch that returns canned responses by URL pattern */
function buildFetchMock(overrides: Record<string, unknown>) {
  return vi.fn(async (url: string, opts?: RequestInit) => {
    for (const [pattern, body] of Object.entries(overrides)) {
      if (url.includes(pattern)) {
        const isString = typeof body === 'string';
        return {
          ok: true,
          status: 200,
          json: async () => (isString ? JSON.parse(body as string) : body),
          text: async () => (isString ? (body as string) : JSON.stringify(body)),
        } as unknown as Response;
      }
    }
    // Default: 404
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' } as unknown as Response;
  });
}

const FAKE_PR_DATA = {
  title: 'Test PR',
  body: 'description',
  head: { sha: 'abc123' },
  base: { ref: 'main' },
};

const FAKE_DIFF = '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1 +1 @@\n-old\n+new\n';

/** Generate an array of fake file entries */
function makeFiles(count: number, prefix = 'src/file') {
  return Array.from({ length: count }, (_, i) => ({ filename: `${prefix}${i}.ts` }));
}

describe('GitHubPRReader.fetchPR — pagination & partial analysis', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a small PR (≤30 files) without partial analysis', async () => {
    const files = makeFiles(5);
    const fetchMock = buildFetchMock({
      '/pulls/1"': FAKE_PR_DATA,
      '/pulls/1/files': files,
      // diff endpoint is the same as PR endpoint but with diff Accept header
    });
    // diff response
    fetchMock.mockImplementationOnce(async (url: string) => ({ ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' } as unknown as Response)); // PR details
    vi.stubGlobal('fetch', buildFetchMock({
      'pulls/1/files': files,
      'pulls/1': FAKE_PR_DATA,
    }));

    // Re-mock with a single cohesive fake
    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => files, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.isPartialAnalysis).toBe(false);
    expect(pr.coverage.totalFiles).toBe(5);
    expect(pr.coverage.analyzedFiles).toBe(5);
    expect(pr.coverage.skippedFiles).toBe(0);
    expect(pr.changedFiles).toHaveLength(5);
  });

  it('performs partial analysis for a PR with more than 30 files', async () => {
    // 24 .ts files + 20 .md files = 44 total
    const tsFiles = makeFiles(24, 'src/service');
    const mdFiles = Array.from({ length: 20 }, (_, i) => ({ filename: `docs/doc${i}.md` }));
    const allFiles = [...tsFiles, ...mdFiles];

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        // Only one page (44 < PAGE_SIZE=100)
        return { ok: true, status: 200, json: async () => allFiles, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(44);
    expect(pr.coverage.analyzedFiles).toBe(30);
    expect(pr.coverage.skippedFiles).toBe(14);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.selectionStrategy).toContain('partial');
    // .ts files must appear more than .md files (higher score → prioritised)
    const tsCount = pr.changedFiles.filter((f) => f.endsWith('.ts')).length;
    const mdCount = pr.changedFiles.filter((f) => f.endsWith('.md')).length;
    expect(tsCount).toBeGreaterThan(mdCount);
    // All 24 .ts files fit inside the 30-file cap, so every .ts should be present
    expect(tsCount).toBe(24);
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
          // Page 1: return full PAGE_SIZE=100 → triggers another request
          return { ok: true, status: 200, json: async () => page1, text: async () => '' };
        } else if (fileCallCount === 2) {
          // Page 2: return 50 items (< PAGE_SIZE) → stops pagination
          return { ok: true, status: 200, json: async () => page2, text: async () => '' };
        }
        // Any further calls → empty (should not happen)
        return { ok: true, status: 200, json: async () => [], text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    expect(pr.coverage.totalFiles).toBe(150);
    expect(pr.coverage.isPartialAnalysis).toBe(true);
    expect(pr.coverage.analyzedFiles).toBeLessThanOrEqual(30);
  });

  it('truncates oversized diffs gracefully instead of throwing', async () => {
    const bigDiff = 'x'.repeat(250 * 1024); // 250 KB > 200 KB limit
    const files = makeFiles(3);

    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: true, status: 200, json: async () => files, text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => bigDiff };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    // Should not throw; diff is truncated
    expect(pr.diff.length).toBeLessThanOrEqual(200 * 1024 + 200); // small overhead for notice
    expect(pr.diff).toContain('truncated');
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

  it('surfaces 403 as a rate-limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403, json: async () => ({}), text: async () => '' }))
    );

    await expect(
      GitHubPRReader.fetchPR('https://github.com/owner/repo/pull/1')
    ).rejects.toThrow(/rate limit/i);
  });

  it('continues gracefully when file-list endpoint returns non-OK', async () => {
    const fakeFetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const accept = (opts as any)?.headers?.Accept ?? '';
      if (url.includes('/files')) {
        return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
      }
      if (accept.includes('diff')) {
        return { ok: true, status: 200, json: async () => ({}), text: async () => FAKE_DIFF };
      }
      return { ok: true, status: 200, json: async () => FAKE_PR_DATA, text: async () => '' };
    }) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fakeFetch);

    const pr = await GitHubPRReader.fetchPR(
      'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1'
    );

    // Should succeed with empty file list (non-fatal)
    expect(pr.changedFiles).toHaveLength(0);
    expect(pr.coverage.totalFiles).toBe(0);
  });
});
