export interface PaymentRecord {
  paymentId: string;
  originalAmountMinor: number;
  currency: string;
  status: 'SETTLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  refundedAmountMinor: number;
}

export interface RefundRequest {
  paymentId: string;
  idempotencyKey: string;
  amountMinor: number;
  reason?: string;
  requestId: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  paymentId: string;
  idempotencyKey: string;
  amountMinor: number;
  status: 'COMMITTED' | 'DUPLICATE_IGNORED' | 'CONFLICT_REJECTED' | 'INVALID_STATE';
  error?: string;
  executedAtUtc: string;
}

export interface IdempotencyLedgerEntry {
  idempotencyKey: string;
  paymentId: string;
  amountMinor: number;
  refundId: string;
  committedAtUtc: string;
}
