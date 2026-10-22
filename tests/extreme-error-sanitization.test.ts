import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as analysesHandler } from '../src/app/api/v1/analyses/route';
import { POST as labHandler } from '../src/app/api/v1/lab/verify/route';
import { AgentOrchestrator } from '../src/lib/agents/orchestrator';
import { VerificationRunner } from '../src/lib/verification/runner';

describe('Extreme Bug Hunt: private server errors stay private', () => {
  afterEach(() => vi.restoreAllMocks());

  it('XBUG-12: PR Analysis does not leak upstream internal diagnostic details in HTTP 500 responses', async () => {
    vi.spyOn(AgentOrchestrator, 'run').mockRejectedValueOnce(
      new Error('INTERNAL_DIAGNOSTIC_SHOULD_NOT_BE_PUBLIC')
    );
    const response = await analysesHandler(
      new NextRequest('http://localhost:3000/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRule: 'Refund requests must not produce duplicate side effects.',
          codeSnippet: 'async function refund() { await db.refunds.create({ amount: 10 }); }',
        }),
      })
    );
    expect(response.status).toBe(500);
    const body = await response.text();
    expect(body).not.toContain('INTERNAL_DIAGNOSTIC_SHOULD_NOT_BE_PUBLIC');
    expect(JSON.parse(body).error.code).toBe('ORCHESTRATION_ERROR');
  });

  it('XBUG-13: Verification Lab does not expose internal runner exceptions in HTTP 500 responses', async () => {
    vi.spyOn(VerificationRunner, 'execute').mockRejectedValueOnce(
      new Error('INTERNAL_DIAGNOSTIC_SHOULD_NOT_BE_PUBLIC')
    );
    const response = await labHandler(
      new NextRequest('http://localhost:3000/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: 'fixed',
          paymentId: 'pay_demo_001',
          idempotencyKey: 'internal-error-test',
          amountMinor: 25000,
          concurrency: 2,
        }),
      })
    );
    expect(response.status).toBe(500);
    const body = await response.text();
    expect(body).not.toContain('INTERNAL_DIAGNOSTIC_SHOULD_NOT_BE_PUBLIC');
    expect(JSON.parse(body).error.code).toBe('RUNNER_ERROR');
  });
});
