import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { VerificationRunner } from '../src/lib/verification/runner';
import { POST as analysesHandler } from '../src/app/api/v1/analyses/route';
import { AIProvider } from '../src/lib/ai/provider';
import { VerificationPlannerAgent } from '../src/lib/agents/verification-agent';
import { RequirementAgent } from '../src/lib/agents/requirement-agent';

afterEach(() => vi.restoreAllMocks());

describe('Extreme Bug Hunt: generated code and public API boundaries', () => {
  it('XBUG-04: escapes arbitrary user text when generating copyable executable verification tests', async () => {
    const injection = "key', injected: (() => { throw new Error('unsafe expression'); })(), next: '";
    const paymentId = "pay', special: true, next: '";
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed', paymentId, idempotencyKey: injection, amountMinor: 25000, concurrency: 2,
    });
    expect(evidence.testSpriteAssertion).toContain('paymentId: ' + JSON.stringify(paymentId) + ',');
    expect(evidence.testSpriteAssertion).toContain('idempotencyKey: ' + JSON.stringify(injection) + ',');
    expect(evidence.observedEffects).toBe(1);
  });

  it('XBUG-05: rejects excessive caller-supplied filePaths length rather than processing arbitrary arrays', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessRule: 'The refund amount cannot exceed the settled payment amount.',
        codeSnippet: 'async function refund(key) { await sleep(20); return refundAmount; }',
        filePaths: Array.from({ length: 31 }, (_, i) => 'src/file-' + i + '.ts'),
      }),
    });
    const response = await analysesHandler(req);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_INPUT');
  });

  it('XBUG-06: does not falsely label heuristic planner fallback as successful neural output', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: '{not-json', isRealModel: true, modelName: 'test/neural',
    });
    const inv = [RequirementAgent.fallbackInvariant('Refunds must be idempotent: one side effect per key.')];
    const result = await VerificationPlannerAgent.plan(inv, [{
      id: 'RISK-TEST', ruleId: inv[0].id, severity: 'HIGH',
      sourcePaths: [], sourceLineRefs: [],
      why: 'A refund race can duplicate side effects', counterexample: 'Concurrent retries', status: 'POTENTIAL',
    }]);
    expect(result.plans).toHaveLength(1);
    expect(result.isRealModel).toBe(false);
    expect(result.modelName).toMatch(/heuristic/i);
  });

  it('XBUG-07: does not label skipped planner stage as neural execution', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    const inv = [RequirementAgent.fallbackInvariant('Refunds must be idempotent: one side effect per key.')];
    const result = await VerificationPlannerAgent.plan(inv, []);
    expect(result.plans).toHaveLength(0);
    expect(result.isRealModel).toBe(false);
  });
});
