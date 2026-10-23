import { describe, it, expect } from 'vitest';
import type { VerificationPlan } from '../src/lib/schemas/agent-schemas';
import { buildProposedAssertion } from '../src/lib/verification/proposed-assertions';

const paymentPlan: VerificationPlan = {
  findingId: 'RISK-001',
  testType: 'IDEMPOTENCY_CONCURRENCY',
  fixtureId: 'refund-vulnerable-v1',
  inputVector: { concurrency: 2, paymentId: 'pay_demo_001' },
  expectedEffects: 'At most one side effect',
  supportState: 'SUPPORTED',
};

const jwtPlan: VerificationPlan = {
  findingId: 'RISK-002',
  testType: 'AUTH_STATE',
  inputVector: { jwtAlgorithm: 'none', signaturePresent: false },
  expectedEffects: 'Reject unsigned JWT',
  supportState: 'UNSUPPORTED',
};

describe('Honest proposed assertion boundary', () => {
  it('generates an executable regression test only against the supported synthetic refund fixture', () => {
    const suggestion = buildProposedAssertion(paymentPlan);
    expect(suggestion?.isExecutableFixtureTest).toBe(true);
    expect(suggestion?.code).toContain("/api/v1/lab/verify");
    expect(suggestion?.code).toContain("fixture: 'vulnerable'");
    expect(suggestion?.code).toContain("expect(evidence.verdict).toBe('VERIFIED_FAIL')");
    expect(suggestion?.scopeNote).toContain('does not execute or verify the analyzed external PR');
  });

  it('never pretends unsupported JWT authentication verification has executed', () => {
    const suggestion = buildProposedAssertion(jwtPlan);
    expect(suggestion?.isExecutableFixtureTest).toBe(false);
    expect(suggestion?.code).toContain('test.skip(');
    expect(suggestion?.scopeNote).toContain('NOT EXECUTED');
    expect(suggestion?.code).not.toContain("fixture: 'vulnerable'");
  });

  it('does not generate arbitrary runnable code for unrecognized verification plans', () => {
    expect(buildProposedAssertion({ ...paymentPlan, fixtureId: 'external-server' })).toBeNull();
    expect(buildProposedAssertion({ ...jwtPlan, testType: 'BOUNDARY_CHECK' })).toBeNull();
    expect(buildProposedAssertion()).toBeNull();
  });
});
