import type { VerificationPlan } from '../schemas/agent-schemas';

export interface ProposedAssertion {
  code: string;
  isExecutableFixtureTest: boolean;
  scopeNote: string;
}

/**
 * Suggestions are derived only from known first-party fixtures or explicit
 * unsupported plans. Never generate an executable test that claims to verify
 * an arbitrary external PR or auth service.
 */
export function buildProposedAssertion(plan?: VerificationPlan): ProposedAssertion | null {
  if (!plan) return null;

  if (
    plan.testType === 'IDEMPOTENCY_CONCURRENCY' &&
    plan.supportState === 'SUPPORTED' &&
    plan.fixtureId === 'refund-vulnerable-v1'
  ) {
    return {
      isExecutableFixtureTest: true,
      scopeNote:
        'Runnable against the first-party vulnerable refund fixture ONLY. It reproduces a synthetic concurrency regression and does not execute or verify the analyzed external PR.',
      code: [
        "import { test, expect } from '@playwright/test';",
        "",
        "test('Example Assertion — synthetic concurrent refund reproduction', async ({ request }) => {",
        "  const response = await request.post('/api/v1/lab/verify', {",
        "    data: {",
        "      fixture: 'vulnerable',",
        "      paymentId: 'pay_demo_001',",
        "      idempotencyKey: 'example_concurrent_retry',",
        "      amountMinor: 50000,",
        "      concurrency: 2,",
        "    },",
        "  });",
        "  expect(response.status()).toBe(200);",
        "  const evidence = await response.json();",
        "  expect(evidence.targetId).toBe('refund-vulnerable-v1');",
        "  expect(evidence.verdict).toBe('VERIFIED_FAIL');",
        "  expect(evidence.observedEffects).toBeGreaterThan(1);",
        "});",
      ].join('\n'),
    };
  }

  if (plan.testType === 'AUTH_STATE' && plan.supportState === 'UNSUPPORTED') {
    return {
      isExecutableFixtureTest: false,
      scopeNote:
        'PROPOSED ONLY — NOT EXECUTED. No first-party JWT verification fixture or target authentication endpoint is available. This intentionally skipped template cannot establish a JWT vulnerability.',
      code: [
        "import { test, expect } from '@playwright/test';",
        "",
        "test.skip('Example Assertion — JWT none algorithm must be rejected (UNSUPPORTED)', async ({ request }) => {",
        "  // TODO: Point this test to a real, authorized authentication endpoint.",
        "  // TODO: Construct a controlled unsigned JWT in an isolated environment.",
        "  // The expected result is rejection (HTTP 401 or 403).",
        "  // No request is sent by this deliberately skipped template.",
        "  void request;",
        "  // After a real endpoint is integrated, assert: expect(response.status()).toBe(401);",
        "});",
      ].join('\n'),
    };
  }

  return null;
}
