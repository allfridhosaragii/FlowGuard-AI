import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { FixedRefundService } from '../src/lib/domain/refund/fixed-refund';
import { POST as labVerify } from '../src/app/api/v1/lab/verify/route';
import { VerificationRunner } from '../src/lib/verification/runner';

describe('Extreme Bug Hunt: validation and evidence safety', () => {
  it.each([
    ['negative', -1],
    ['zero', 0],
    ['fractional', 1.5],
    ['NaN', Number.NaN],
  ])('XBUG-09: rejects %s refund amounts at the domain service boundary', async (_name, amountMinor) => {
    const service = new FixedRefundService();
    const response = await service.processRefund({
      paymentId: 'pay_demo_001',
      idempotencyKey: 'boundary-check',
      requestId: 'negative-check',
      amountMinor,
    });
    expect(response.success).toBe(false);
    expect(response.status).toBe('INVALID_STATE');
    expect(service.getCommittedRefunds()).toHaveLength(0);
  });

  it('XBUG-10: rejects requested repeated iterations instead of silently running once', async () => {
    const response = await labVerify(new NextRequest('http://localhost:3000/api/v1/lab/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        fixture: 'fixed',
        paymentId: 'pay_demo_001',
        idempotencyKey: 'unimplemented-iterations',
        amountMinor: 25000,
        concurrency: 2,
        iterations: 5,
      }),
    }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('INVALID_INPUT');
    expect(body.error.message).toMatch(/iteration/i);
  });

  it('XBUG-11: generated executable verification assertion safely serializes user-defined string values', async () => {
    const paymentId = 'pay_"quoted"\nsecond-line';
    const idempotencyKey = 'test_\"; harmless_marker(); //';
    const evidence = await VerificationRunner.execute({
      fixture: 'fixed',
      paymentId,
      idempotencyKey,
      amountMinor: 25000,
      concurrency: 2,
    });
    expect(evidence.verdict).toBe('VERIFIED_PASS');
    expect(evidence.testSpriteAssertion).toContain('paymentId: ' + JSON.stringify(paymentId));
    expect(evidence.testSpriteAssertion).toContain('idempotencyKey: ' + JSON.stringify(idempotencyKey));
  });
});
