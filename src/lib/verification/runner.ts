import { VulnerableRefundService } from '../domain/refund/vulnerable-refund';
import { FixedRefundService } from '../domain/refund/fixed-refund';
import { RefundRequest, RefundResult } from '../domain/refund/types';
import {
  VerificationEvidence,
  VerificationInputVector,
  VerificationTimelineEvent,
  VerificationVerdict,
} from './evidence';

export class VerificationRunner {
  private static readonly INVARIANT_ID = 'INV-REFUND-001';
  private static readonly INVARIANT_DESC =
    'A settled payment can create at most one refund side effect for a given idempotency key, even under concurrent retries.';

  /**
   * Run the controlled verification test harness with real concurrent asynchronous executions.
   */
  public static async execute(input: VerificationInputVector): Promise<VerificationEvidence> {
    const startTime = Date.now();
    const runId = `run_lab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timeline: VerificationTimelineEvent[] = [];

    // 1. Strict bound checks
    if (!input.idempotencyKey || input.idempotencyKey.trim().length === 0) {
      throw new Error('Idempotency Key is required');
    }
    if (input.concurrency < 1 || input.concurrency > 5) {
      throw new Error('Concurrency must be between 1 and 5 concurrent asynchronous requests');
    }
    if (input.amountMinor < 1 || input.amountMinor > 1000000) {
      throw new Error('Amount must be between 1 and 1,000,000 minor units');
    }

    const service =
      input.fixture === 'vulnerable'
        ? new VulnerableRefundService()
        : new FixedRefundService();

    const targetId =
      input.fixture === 'vulnerable' ? 'refund-vulnerable-v1' : 'refund-fixed-v1';

    // Dynamic commit SHA & version provenance (no hardcoded legacy SHA)
    const commitSha =
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      'pkg:v1.0.0';
    const targetVersion = `${targetId}@${commitSha.substring(0, 7)}`;

    // 2. Prepare parallel concurrent asynchronous tasks
    const tasks: Promise<RefundResult>[] = [];
    const payloadMode = input.payloadMode || 'same_amount';

    for (let i = 0; i < input.concurrency; i++) {
      const requestId = `Request_Async_${i + 1}`;
      const amount =
        payloadMode === 'differing_amount' && i > 0
          ? input.amountMinor + 1000 * i
          : input.amountMinor;

      const req: RefundRequest = {
        paymentId: input.paymentId,
        idempotencyKey: input.idempotencyKey,
        amountMinor: amount,
        requestId: `req_${i + 1}`,
      };

      timeline.push({
        step: timeline.length + 1,
        threadId: requestId,
        action: `Dispatched concurrent asynchronous request (amount: ${amount})`,
        timestampOffsetMs: Date.now() - startTime,
      });

      tasks.push(
        service.processRefund(req).then((res) => {
          timeline.push({
            step: timeline.length + 1,
            threadId: requestId,
            action: `Received response with status: ${res.status}`,
            resultStatus: res.status,
            timestampOffsetMs: Date.now() - startTime,
          });
          return res;
        })
      );
    }

    // 3. Await all concurrent asynchronous tasks via Promise.all
    await Promise.all(tasks);

    // 4. Calculate actual side effects observed on the service state
    const committedRefunds = service.getCommittedRefunds();
    const observedEffects = committedRefunds.length;

    // 5. Evaluate Invariant
    let verdict: VerificationVerdict = 'INCONCLUSIVE';
    if (observedEffects > 1) {
      verdict = 'VERIFIED_FAIL';
    } else if (observedEffects <= 1) {
      verdict = 'VERIFIED_PASS';
    }

    const durationMs = Date.now() - startTime;

    // 6. Generate TestSprite 3.0 compatible assertion targeting the real verified endpoint
    const testSpriteAssertion = generateTestSpriteCode(input, observedEffects, verdict);

    return {
      runId,
      targetType: 'FIRST_PARTY_FIXTURE',
      targetId,
      targetVersion,
      invariantId: this.INVARIANT_ID,
      invariantDescription: this.INVARIANT_DESC,
      input,
      expectedMaxEffects: 1,
      observedEffects,
      verdict,
      executedAtUtc: new Date().toISOString(),
      executionDurationMs: durationMs,
      timeline,
      testSpriteAssertion,
      notes: [
        `Target: Verified synthetic first-party fixture '${targetId}' (${targetVersion}) via concurrent Promise.all.`,
        'Scope Guarantee: This verification proves behavioral outcome on the executed fixture ONLY. It does NOT imply verification of arbitrary external GitHub PRs.',
      ],
    };
  }
}

/**
 * Synthesizes a real, executable Playwright / TestSprite test that targets
 * FlowGuard AI's actual /api/v1/lab/verify API endpoint.
 */
function generateTestSpriteCode(
  input: VerificationInputVector,
  observedEffects: number,
  verdict: VerificationVerdict
): string {
  return `/**
 * TestSprite 3.0 Automated Test Assertion
 * Target: /api/v1/lab/verify (FlowGuard AI Real Lab Endpoint)
 * Invariant: INV-REFUND-001 (Max 1 side-effect per idempotency key)
 * Fixture: ${input.fixture} (${input.concurrency} concurrent asynchronous requests)
 */
test('TestSprite: Idempotency under ${input.concurrency} concurrent requests', async ({ request }) => {
  const response = await request.post('/api/v1/lab/verify', {
    data: {
      fixture: '${input.fixture}',
      paymentId: ${JSON.stringify(input.paymentId)},
      idempotencyKey: ${JSON.stringify(input.idempotencyKey)},
      amountMinor: ${input.amountMinor},
      concurrency: ${input.concurrency},
      payloadMode: '${input.payloadMode || 'same_amount'}'
    }
  });

  expect(response.status()).toBe(200);
  const evidence = await response.json();

  // Invariant Assertion: observed side effects must not exceed 1
  expect(evidence.invariantId).toBe('INV-REFUND-001');
  ${
    verdict === 'VERIFIED_FAIL'
      ? `// Failure reproduction confirmed: vulnerable fixture observed ${observedEffects} effects (expected <= 1)
  expect(evidence.verdict).toBe('VERIFIED_FAIL');
  expect(evidence.observedEffects).toBeGreaterThan(1);`
      : `// Verification passing confirmed: fixed fixture observed ${observedEffects} effect (expected <= 1)
  expect(evidence.verdict).toBe('VERIFIED_PASS');
  expect(evidence.observedEffects).toBeLessThanOrEqual(1);`
  }
});`;
}
