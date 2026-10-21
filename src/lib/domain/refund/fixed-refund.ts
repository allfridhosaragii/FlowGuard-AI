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
  private inFlightClaims: Map<string, { paymentId: string; amountMinor: number; promise: Promise<RefundResult> }> = new Map();
  private reservedAmountMinor = 0;

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
      if (existing.amountMinor !== amountMinor || existing.paymentId !== paymentId) {
        return {
          success: false,
          paymentId,
          idempotencyKey,
          amountMinor,
          status: 'CONFLICT_REJECTED',
          error: 'Idempotency conflict: key was previously used for another payment or amount',
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
      // Conflicting retries MUST NOT inherit a successful refund from the first request.
      if (activeFlight.paymentId !== paymentId || activeFlight.amountMinor !== amountMinor) {
        return {
          success: false,
          paymentId,
          idempotencyKey,
          amountMinor,
          status: 'CONFLICT_REJECTED',
          error: 'Idempotency conflict: key is already processing another payment or amount',
          executedAtUtc: new Date().toISOString(),
        };
      }
      const activeResult = await activeFlight.promise;
      return {
        ...activeResult,
        status: activeResult.success ? 'DUPLICATE_IGNORED' : activeResult.status,
      };
    }

    // STEP 3: Synchronously reserve refundable funds across ALL distinct idempotency keys.
    // Merely locking each key is insufficient: independent keys race on the same balance.
    if (this.payment.refundedAmountMinor + this.reservedAmountMinor + amountMinor > this.payment.originalAmountMinor) {
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
    this.reservedAmountMinor += amountMinor;

    // STEP 4: Reserve in-flight key BEFORE any async operations
    const executionPromise = (async (): Promise<RefundResult> => {
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

    this.inFlightClaims.set(idempotencyKey, { paymentId, amountMinor, promise: executionPromise });

    try {
      return await executionPromise;
    } finally {
      this.inFlightClaims.delete(idempotencyKey);
      this.reservedAmountMinor -= amountMinor;
    }
  }
}
