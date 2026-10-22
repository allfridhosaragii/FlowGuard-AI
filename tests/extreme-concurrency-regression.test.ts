import { describe, expect, it } from 'vitest';
import { FixedRefundService } from '../src/lib/domain/refund/fixed-refund';
import { VerificationRunner } from '../src/lib/verification/runner';

describe('Extreme Bug Hunt: corrected refund fixture invariants', () => {
  it('XBUG-01: prevents over-refunding when different idempotency keys race for same payment', async () => {
    const svc = new FixedRefundService();
    const [first, second] = await Promise.all([
      svc.processRefund({
        paymentId: 'pay_demo_001',
        idempotencyKey: 'legit-first',
        amountMinor: 125000,
        requestId: 'race-a',
      }),
      svc.processRefund({
        paymentId: 'pay_demo_001',
        idempotencyKey: 'legit-second',
        amountMinor: 125000,
        requestId: 'race-b',
      }),
    ]);

    expect([first, second].filter((r) => r.status === 'COMMITTED')).toHaveLength(1);
    expect(svc.getCommittedRefunds().reduce((sum, refund) => sum + refund.amountMinor, 0)).toBe(125000);
    expect([first, second].some((r) => r.status === 'INVALID_STATE')).toBe(true);
  });

  it('XBUG-02: rejects differing amounts immediately when idempotency key is in flight', async () => {
    const svc = new FixedRefundService();
    const first = svc.processRefund({
      paymentId: 'pay_demo_001',
      idempotencyKey: 'active-key',
      amountMinor: 25000,
      requestId: 'start',
    });
    const conflicting = await svc.processRefund({
      paymentId: 'pay_demo_001',
      idempotencyKey: 'active-key',
      amountMinor: 35000,
      requestId: 'conflicting',
    });
    expect(conflicting.success).toBe(false);
    expect(conflicting.status).toBe('CONFLICT_REJECTED');
    expect((await first).status).toBe('COMMITTED');
    expect(svc.getCommittedRefunds()).toHaveLength(1);
  });

  it('XBUG-03: rejects reuse of an idempotency key for another payment', async () => {
    const svc = new FixedRefundService({
      paymentId: 'pay_one',
      originalAmountMinor: 125000,
      currency: 'USD',
      status: 'SETTLED',
      refundedAmountMinor: 0,
    });
    const first = await svc.processRefund({
      paymentId: 'pay_one',
      idempotencyKey: 'same-key-across-payments',
      amountMinor: 25000,
      requestId: 'first',
    });
    expect(first.status).toBe('COMMITTED');
    const second = await svc.processRefund({
      paymentId: 'pay_two',
      idempotencyKey: 'same-key-across-payments',
      amountMinor: 25000,
      requestId: 'second',
    });
    expect(second.status).toBe('CONFLICT_REJECTED');
    expect(second.success).toBe(false);
    expect(svc.getCommittedRefunds()).toHaveLength(1);
  });
  it('XBUG-08: does not report a successful verification when no refund can commit', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed',
      paymentId: 'pay_demo_001',
      idempotencyKey: 'no-money-left',
      amountMinor: 200000,
      concurrency: 2,
    });
    expect(evidence.observedEffects).toBe(0);
    expect(evidence.timeline.some((event) => event.resultStatus === 'INVALID_STATE')).toBe(true);
    expect(evidence.verdict).toBe('INCONCLUSIVE');
    expect(evidence.testSpriteAssertion).toContain("expect(evidence.verdict).toBe('INCONCLUSIVE')");
  });
});
