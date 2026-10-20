import { PaymentRecord, RefundRequest, RefundResult } from './types';

/**
 * Vulnerable Refund Service (Fixture: refund-vulnerable-v1)
 * 
 * Flaw: Non-atomic read-then-write check without distributed/memory lock.
 * When concurrent requests arrive simultaneously with the same idempotency key,
 * both concurrent asynchronous requests read the uncommitted state during the async I/O window and both
 * commit a duplicate refund side effect.
 */
export class VulnerableRefundService {
  private payment: PaymentRecord;
  private committedRefunds: RefundResult[] = [];
  private ledger: Map<string, RefundResult> = new Map();

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
    const { paymentId, idempotencyKey, amountMinor, requestId } = request;

    // STEP 1: Check if already refunded (NON-ATOMIC READ)
    const existing = this.ledger.get(idempotencyKey);
    if (existing) {
      return {
        ...existing,
        status: 'DUPLICATE_IGNORED',
      };
    }

    // STEP 2: Non-atomic balance validation
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

    // VULNERABILITY WINDOW:
    // Simulates non-blocking asynchronous database / payment gateway latency (e.g. 15-25ms).
    // During this gap, a concurrent request arrives and reads `this.ledger.get(idempotencyKey) === undefined`!
    await new Promise((resolve) => setTimeout(resolve, 20));

    // STEP 3: Commit refund side-effect (UNPROTECTED WRITE)
    const refundId = `ref_vuln_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
  }
}
