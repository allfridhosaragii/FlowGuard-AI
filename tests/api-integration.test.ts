import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthHandler } from '../src/app/api/v1/health/route';
import { POST as labVerifyHandler } from '../src/app/api/v1/lab/verify/route';
import { POST as analysesHandler } from '../src/app/api/v1/analyses/route';

describe('API Route Handlers Integration Suite', () => {
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
    });
  });
});
