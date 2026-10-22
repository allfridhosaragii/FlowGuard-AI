import { describe, it, expect } from 'vitest';
import { VerificationRunner } from '../src/lib/verification/runner';
import { VulnerableRefundService } from '../src/lib/domain/refund/vulnerable-refund';
import { FixedRefundService } from '../src/lib/domain/refund/fixed-refund';

describe('Controlled Verification Lab - INV-REFUND-001', () => {
  it('V-01: vulnerable fixture under concurrency 2 produces duplicate refunds (VERIFIED_FAIL)', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'vulnerable',
      paymentId: 'pay_test_001',
      idempotencyKey: 'key_concurrent_race',
      amountMinor: 50000,
      concurrency: 2,
    });

    expect(evidence.targetId).toBe('refund-vulnerable-v1');
    expect(evidence.observedEffects).toBe(2);
    expect(evidence.verdict).toBe('VERIFIED_FAIL');
    expect(evidence.timeline.length).toBeGreaterThanOrEqual(4);
  });

  it('V-02: fixed fixture under concurrency 2 commits exactly once (VERIFIED_PASS)', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed',
      paymentId: 'pay_test_002',
      idempotencyKey: 'key_concurrent_fixed',
      amountMinor: 50000,
      concurrency: 2,
    });

    expect(evidence.targetId).toBe('refund-fixed-v1');
    expect(evidence.observedEffects).toBe(1);
    expect(evidence.verdict).toBe('VERIFIED_PASS');
  });

  it('V-03: vulnerable fixture under concurrency 1 legitimately passes because there is no competing concurrent request', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'vulnerable',
      paymentId: 'pay_test_003',
      idempotencyKey: 'key_single_request',
      amountMinor: 25000,
      concurrency: 1,
    });

    expect(evidence.observedEffects).toBe(1);
    expect(evidence.verdict).toBe('VERIFIED_PASS');
  });

  it('V-04: fixed fixture under high concurrency 5 maintains strict idempotency (VERIFIED_PASS)', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed',
      paymentId: 'pay_test_004',
      idempotencyKey: 'key_high_concurrency',
      amountMinor: 10000,
      concurrency: 5,
    });

    expect(evidence.observedEffects).toBe(1);
    expect(evidence.verdict).toBe('VERIFIED_PASS');
  });

  it('V-05: fixed fixture rejects conflicting reuse of idempotency key with differing amounts', async () => {
    const service = new FixedRefundService({
      paymentId: 'pay_test_005',
      originalAmountMinor: 125000,
      currency: 'USD',
      status: 'SETTLED',
      refundedAmountMinor: 0,
    });
    const req1 = await service.processRefund({
      paymentId: 'pay_test_005',
      idempotencyKey: 'key_conflict_check',
      amountMinor: 50000,
      requestId: 'req_1',
    });
    expect(req1.status).toBe('COMMITTED');

    const req2 = await service.processRefund({
      paymentId: 'pay_test_005',
      idempotencyKey: 'key_conflict_check',
      amountMinor: 75000, // Different amount!
      requestId: 'req_2',
    });
    expect(req2.status).toBe('CONFLICT_REJECTED');
    expect(req2.success).toBe(false);
  });

  it('V-06: rejects missing or empty idempotency key', async () => {
    await expect(
      VerificationRunner.execute({
        fixture: 'vulnerable',
        paymentId: 'pay_test_006',
        idempotencyKey: '',
        amountMinor: 50000,
        concurrency: 2,
      })
    ).rejects.toThrow(/Idempotency key is required/i);
  });

  it('V-07: rejects concurrency outside bounds [1, 5]', async () => {
    await expect(
      VerificationRunner.execute({
        fixture: 'fixed',
        paymentId: 'pay_test_007',
        idempotencyKey: 'key_bounds',
        amountMinor: 50000,
        concurrency: 0,
      })
    ).rejects.toThrow(/Concurrency must be between 1 and 5/);

    await expect(
      VerificationRunner.execute({
        fixture: 'fixed',
        paymentId: 'pay_test_007',
        idempotencyKey: 'key_bounds',
        amountMinor: 50000,
        concurrency: 6,
      })
    ).rejects.toThrow(/Concurrency must be between 1 and 5/);
  });

  it('V-08: generates TestSprite assertion targeting the real executable /api/v1/lab/verify endpoint', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed',
      paymentId: 'pay_test_008',
      idempotencyKey: 'key_code_gen',
      amountMinor: 50000,
      concurrency: 2,
    });

    expect(evidence.testSpriteAssertion).toContain('/api/v1/lab/verify');
    expect(evidence.testSpriteAssertion).toContain("expect(response.status()).toBe(200)");
    expect(evidence.testSpriteAssertion).toContain("expect(evidence.verdict).toBe('VERIFIED_PASS')");
  });

  it('V-09: evidence includes explicit scope guarantee and no hardcoded commit SHA', async () => {
    const evidence = await VerificationRunner.execute({
      fixture: 'vulnerable',
      paymentId: 'pay_test_009',
      idempotencyKey: 'key_scope_check',
      amountMinor: 50000,
      concurrency: 2,
    });

    expect(evidence.notes.some((n) => n.includes('Scope Guarantee'))).toBe(true);
    expect(evidence.targetVersion).not.toBe('git:7ae716e#fixture'); // No legacy hardcode
  });
});
