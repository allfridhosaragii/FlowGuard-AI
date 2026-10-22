import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthHandler } from '../src/app/api/v1/health/route';
import { POST as labVerifyHandler } from '../src/app/api/v1/lab/verify/route';
import { POST as analysesHandler } from '../src/app/api/v1/analyses/route';
import { GitHubPRReader } from '../src/lib/github/pr-reader';

describe('API Route Handlers Integration Suite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('returns 200 OK with accurate system metadata and without leaking secrets', async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.service).toContain('FlowGuard AI');
      expect(data.buildVersion).toBe('1.0.0');
      expect(data.features.verificationLab).toBe(true);
      expect(data.features.githubPrAnalysis).toBe(true);
      expect(data.supportedInvariants).toContain('INV-REFUND-001');

      // Security check: ensure no raw secret strings are in payload
      const jsonStr = JSON.stringify(data);
      expect(jsonStr).not.toContain('AIzaSy');
      expect(jsonStr).not.toContain('sk-');
      expect(jsonStr).not.toContain('ghp_');
    });
  });

  describe('POST /api/v1/lab/verify', () => {
    it('returns 200 and VERIFIED_FAIL for vulnerable fixture under concurrency 2', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'vulnerable',
          paymentId: 'pay_api_001',
          idempotencyKey: 'api_test_race_key',
          amountMinor: 50000,
          concurrency: 2,
        }),
      });

      const response = await labVerifyHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.verdict).toBe('VERIFIED_FAIL');
      expect(data.observedEffects).toBe(2);
      expect(data.expectedMaxEffects).toBe(1);
      expect(data.invariantId).toBe('INV-REFUND-001');
      expect(data.testSpriteAssertion).toContain("expect(evidence.verdict).toBe('VERIFIED_FAIL')");
    });

    it('returns 200 and VERIFIED_PASS for fixed fixture under concurrency 2', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'fixed',
          paymentId: 'pay_api_002',
          idempotencyKey: 'api_test_fixed_key',
          amountMinor: 50000,
          concurrency: 2,
        }),
      });

      const response = await labVerifyHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.verdict).toBe('VERIFIED_PASS');
      expect(data.observedEffects).toBe(1);
      expect(data.testSpriteAssertion).toContain("expect(evidence.verdict).toBe('VERIFIED_PASS')");
    });

    it('returns 400 INVALID_INPUT when concurrency exceeds 5', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'fixed',
          paymentId: 'pay_api_err',
          idempotencyKey: 'err_key',
          amountMinor: 50000,
          concurrency: 10, // Invalid: max 5
        }),
      });

      const response = await labVerifyHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('returns 400 INVALID_INPUT when idempotency key is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'fixed',
          paymentId: 'pay_api_err',
          idempotencyKey: '', // Missing
          amountMinor: 50000,
          concurrency: 2,
        }),
      });

      const response = await labVerifyHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('POST /api/v1/analyses', () => {
    it('returns 200 with structured analysis result for valid code snippet', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule:
            'A settled payment can create at most one refund side effect for a given idempotency key.',
          codeSnippet: `
async function processRefund(idempotencyKey, amount) {
  const existing = await db.find(idempotencyKey);
  if (!existing) {
    await sleep(20);
    await db.insertRefund(idempotencyKey, amount);
  }
}
`,
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.runId).toBeTruthy();
      expect(data.verdict).toBe('POTENTIAL');
      expect(data.invariants.length).toBeGreaterThanOrEqual(1);
      expect(data.findings.length).toBeGreaterThanOrEqual(1);
      expect(data.plans.length).toBeGreaterThanOrEqual(1);
      expect(data.stages.length).toBe(6);
      expect(data.selectedPrUrl).toBeNull();
      expect(data.prFetchStatus).toBe('NOT_APPLICABLE');
    });

    it('returns 400 INVALID_INPUT when business rule is too short (< 10 chars)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule: 'short',
          codeSnippet: 'const x = 1;',
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('returns 400 INVALID_INPUT when neither codeSnippet nor githubPrUrl is provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule: 'Valid business rule for testing purposes.',
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
      expect(data.error.message).toContain('Either a valid GitHub PR URL or a non-empty code snippet must be provided');
    });

    it('returns 400 INVALID_INPUT when codeSnippet contains only whitespace (ANA-004 regression)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule: 'A settled payment can create at most one refund side effect.',
          codeSnippet: '   \n  \t  ',
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
      expect(data.error.message).toContain('Either a valid GitHub PR URL or a non-empty code snippet must be provided');
    });

    it('returns 400 INVALID_INPUT with actionable message when idempotencyKey contains only whitespace (LAB-007 regression)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'vulnerable',
          paymentId: 'pay_api_err',
          idempotencyKey: '    ',
          amountMinor: 50000,
          concurrency: 2,
        }),
      });

      const response = await labVerifyHandler(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe('INVALID_INPUT');
      expect(data.error.message).toContain('Idempotency Key is required');
    });

    it('returns 422 GITHUB_FETCH_ERROR when GitHub PR fetch fails (prevents false NO_RISK_FOUND)', async () => {
      vi.spyOn(GitHubPRReader, 'fetchPR').mockRejectedValueOnce(
        new Error('GitHub PR contains no readable code patches or diff evidence for analysis.')
      );

      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule:
            'A settled payment can create at most one refund side effect for a given idempotency key.',
          githubPrUrl: 'https://github.com/owner/repo/pull/1',
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(422);

      const data = await response.json();
      expect(data.error.code).toBe('GITHUB_FETCH_ERROR');
      expect(data.error.message).toContain('no readable code patches');
      // Proves no fake NO_RISK_FOUND verdict is emitted
      expect(data.verdict).toBeUndefined();
      expect(data.prFetchStatus).toBeUndefined();
      expect(data.selectedPrUrl).toBeUndefined();
    });

    it('returns 200 with partial analysis badge metadata when PR is large', async () => {
      vi.spyOn(GitHubPRReader, 'fetchPR').mockResolvedValueOnce({
        owner: 'owner',
        repo: 'repo',
        pullNumber: 1,
        title: 'Large PR',
        description: 'Large feature PR',
        headSha: 'def456',
        baseBranch: 'main',
        changedFiles: ['src/service.ts'],
        diff: 'diff --git a/src/service.ts b/src/service.ts\n--- a/src/service.ts\n+++ b/src/service.ts\n@@ -1 +1 @@\n-a\n+b\n',
        coverage: {
          totalFiles: 45,
          analyzedFiles: 30,
          selectedFiles: 30,
          filesWithPatch: 30,
          skippedFiles: 15,
          isPartialAnalysis: true,
          selectionStrategy: 'partial:top-30-by-relevance',
          incompleteReason: 'pr_file_count_exceeds_analysis_limit',
        },
      });

      const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule:
            'A settled payment can create at most one refund side effect for a given idempotency key.',
          githubPrUrl: 'https://github.com/owner/repo/pull/1',
        }),
      });

      const response = await analysesHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.runId).toBeTruthy();
      expect(data.notes.some((n: string) => n.startsWith('Partial Analysis:'))).toBe(true);
      expect(data.notes.some((n: string) => n.includes('45 changed files'))).toBe(true);
      // Live provenance must be explicit, tied to the exact requested PR URL,
      // and independent of coverage being partial (30 of 45 files analyzed).
      expect(data.sourceReference).toBe('https://github.com/owner/repo/pull/1');
      expect(data.selectedPrUrl).toBe('https://github.com/owner/repo/pull/1');
      expect(data.prFetchStatus).toBe('LIVE_FETCH');
      expect(data.sourceSha).toBe('def456');
    });
  });
});
