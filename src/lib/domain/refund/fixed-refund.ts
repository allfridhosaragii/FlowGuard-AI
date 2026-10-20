import { PaymentRecord, RefundRequest, RefundResult } from './types';

/**
 * Fixed Refund Service (Fixture: refund-fixed-v1)
 * 
 * Solution: Atomic idempotency reservation lock pattern.
 * The idempotency key is claimed synchronously before any asynchronous I/O window.
 * Concurrent requests for the same key either share the in-flight promise or immediately
 * receive the cached committed record without triggering duplicate side effects.
 * Also enforces payload conflict rejection when amount differs.
 */
export class FixedRefundService {
  private payment: PaymentRecord;
  private committedRefunds: RefundResult[] = [];
  private ledger: Map<string, RefundResult> = new Map();
  private inFlightClaims: Map<string, Promise<RefundResult>> = new Map();

  constructor(payment?: PaymentRecord) {
    this.payment = payment || {
      paymentId: 'pay_demo_001',
      originalAmountMinor: 125000,
      currency: 'USD',
      status: 'SETTLED',
      refundedAmountMinor: 0,
    };
  }

  public getCommittedRefunds(): RefundResult[] {
    return [...this.committedRefunds];
  }

  public async processRefund(request: RefundRequest): Promise<RefundResult> {
    const { paymentId, idempotencyKey, amountMinor } = request;

    // STEP 1: Check committed ledger for existing result
    const existing = this.ledger.get(idempotencyKey);
    if (existing) {
      // Check payload consistency
      if (existing.amountMinor !== amountMinor) {
        return {
          success: false,
          paymentId,
          idempotencyKey,
          amountMinor,
          status: 'CONFLICT_REJECTED',
          error: `Idempotency conflict: key was previously used with amount ${existing.amountMinor}, not ${amountMinor}`,
          executedAtUtc: new Date().toISOString(),
        };
      }
      return {
        ...existing,
        status: 'DUPLICATE_IGNORED',
      };
    }

    // STEP 2: Atomic In-Flight Check / Reservation
    // If a request with this key is already executing, await the in-flight execution!
    const activeFlight = this.inFlightClaims.get(idempotencyKey);
    if (activeFlight) {
      const activeResult = await activeFlight;
      return {
        ...activeResult,
        status: 'DUPLICATE_IGNORED',
      };
    }

    // STEP 3: Reserve in-flight lock BEFORE any async operations
    const executionPromise = (async (): Promise<RefundResult> => {
      // Validate bounds & balance
      if (this.payment.refundedAmountMinor + amountMinor > this.payment.originalAmountMinor) {
        return {
          success: false,
          paymentId,
          idempotencyKey,
          amountMinor,
          status: 'INVALID_STATE',
          error: 'Exceeds refundable amount',
          executedAtUtc: new Date().toISOString(),
        };
      }

      // Simulates real payment gateway / DB operation latency
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Commit exactly once
      const refundId = `ref_fixed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const result: RefundResult = {
        success: true,
        refundId,
        paymentId,
        idempotencyKey,
        amountMinor,
        status: 'COMMITTED',
        executedAtUtc: new Date().toISOString(),
      };

      this.committedRefunds.push(result);
      this.ledger.set(idempotencyKey, result);
      this.payment.refundedAmountMinor += amountMinor;
      this.payment.status =
        this.payment.refundedAmountMinor >= this.payment.originalAmountMinor
          ? 'REFUNDED'
          : 'PARTIALLY_REFUNDED';

      return result;
    })();

    this.inFlightClaims.set(idempotencyKey, executionPromise);

    try {
      return await executionPromise;
    } finally {
      this.inFlightClaims.delete(idempotencyKey);
    }
  }
}
