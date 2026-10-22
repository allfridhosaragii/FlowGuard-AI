import { describe, expect, it } from 'vitest';
import { FixedRefundService } from '../src/lib/domain/refund/fixed-refund';

describe('Extreme Bug Hunt: deterministic property-based refund fuzzing', () => {
  it('XBUG-28: preserves refund balance and idempotency in 60 diverse concurrent schedules', async () => {
    let state = 0x1a2b3c4d;
    const sample = (max: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state % max;
    };
    for (let round = 0; round < 60; round++) {
      const svc = new FixedRefundService();
      const requests = Array.from({ length: 1 + sample(8) }, (_, index) => {
        const request = {
          paymentId: 'pay_demo_001',
          idempotencyKey: 'seeded-key-' + sample(4),
          amountMinor: 1 + sample(90000),
          requestId: 'round-' + round + '-request-' + index,
        };
        return svc.processRefund(request);
      });
      const results = await Promise.all(requests);
      const committed = svc.getCommittedRefunds();
      expect(committed.length).toBeLessThanOrEqual(requests.length);
      expect(new Set(committed.map(x => x.idempotencyKey)).size).toBe(committed.length);
      expect(committed.reduce((sum, item) => sum + item.amountMinor, 0)).toBeLessThanOrEqual(125000);
      expect(committed.every(item => item.amountMinor > 0 && item.success)).toBe(true);
      expect(results.every(item => ['COMMITTED', 'DUPLICATE_IGNORED', 'CONFLICT_REJECTED', 'INVALID_STATE'].includes(item.status))).toBe(true);
    }
  }, 15000);
});
