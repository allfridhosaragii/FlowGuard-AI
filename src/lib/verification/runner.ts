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
   * Run the controlled verification test harness with real concurrent executions.
   */
  public static async execute(input: VerificationInputVector): Promise<VerificationEvidence> {
    const startTime = Date.now();
    const runId = `run_lab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timeline: VerificationTimelineEvent[] = [];

    // 1. Bound checks
    if (!input.idempotencyKey || input.idempotencyKey.trim().length === 0) {
      throw new Error('Idempotency key is required');
    }
    if (input.concurrency < 1 || input.concurrency > 5) {
      throw new Error('Concurrency must be between 1 and 5');
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
    const targetVersion = 'git:7ae716e#fixture';

    // 2. Prepare parallel tasks
    const tasks: Promise<RefundResult>[] = [];
    const payloadMode = input.payloadMode || 'same_amount';

    for (let i = 0; i < input.concurrency; i++) {
      const threadId = `Worker_${i + 1}`;
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
        threadId,
        action: `Dispatched refund request (amount: ${amount})`,
        timestampOffsetMs: Date.now() - startTime,
      });

      tasks.push(
        service.processRefund(req).then((res) => {
          timeline.push({
            step: timeline.length + 1,
            threadId,
            action: `Received response with status: ${res.status}`,
            resultStatus: res.status,
            timestampOffsetMs: Date.now() - startTime,
          });
          return res;
        })
      );
    }

    // 3. Await all concurrent tasks
    const results = await Promise.all(tasks);

    // 4. Calculate actual side effects observed on the service
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

    // 6. Generate TestSprite 3.0 compatible Playwright / API assertion
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
        `Verified synthetic fixture '${targetId}' using real in-process concurrent execution.`,
        'Scope: This test proves behavioral outcome on the isolated fixture only, NOT on arbitrary external repositories.',
      ],
    };
  }
}

function generateTestSpriteCode(
  input: VerificationInputVector,
  observedEffects: number,
  verdict: VerificationVerdict
): string {
  return `/**
 * TestSprite 3.0 Automated Test Assertion
 * Target: ${input.fixture === 'vulnerable' ? 'Vulnerable Refund Service' : 'Fixed Refund Service'}
 * Invariant: INV-REFUND-001 (Max 1 side-effect per idempotency key)
 */
test('TestSprite: Idempotency under ${input.concurrency} concurrent requests', async ({ request }) => {
  const paymentId = '${input.paymentId}';
  const idempotencyKey = '${input.idempotencyKey}';
  const amountMinor = ${input.amountMinor};

  // Launch ${input.concurrency} concurrent HTTP requests simultaneously
  const requests = Array.from({ length: ${input.concurrency} }).map((_, idx) =>
    request.post('/api/v1/payments/refund', {
      data: { paymentId, idempotencyKey, amountMinor }
    })
  );

  const responses = await Promise.all(requests);
  const committedCount = responses.filter(r => r.status() === 200 || r.status() === 201).length;

  // Invariant Assertion
  expect(committedCount).toBeLessThanOrEqual(1);
  ${verdict === 'VERIFIED_FAIL' ? '// Note: Expected to FAIL on vulnerable implementation (Observed: ' + observedEffects + ')' : '// Note: Successfully PASSED (Observed: ' + observedEffects + ')'}
});`;
}
