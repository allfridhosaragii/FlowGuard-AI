export type VerificationVerdict =
  | 'VERIFIED_PASS'
  | 'VERIFIED_FAIL'
  | 'POTENTIAL'
  | 'INCONCLUSIVE'
  | 'ERROR';

export interface VerificationInputVector {
  fixture: 'vulnerable' | 'fixed';
  paymentId: string;
  idempotencyKey: string;
  amountMinor: number;
  concurrency: number;
  payloadMode?: 'same_amount' | 'differing_amount';
  iterations?: number;
}

export interface VerificationTimelineEvent {
  step: number;
  threadId: string;
  action: string;
  resultStatus?: string;
  timestampOffsetMs: number;
}

export interface VerificationEvidence {
  runId: string;
  targetType: 'FIRST_PARTY_FIXTURE' | 'EXTERNAL_PR';
  targetId: string;
  targetVersion: string;
  invariantId: string;
  invariantDescription: string;
  input: VerificationInputVector;
  expectedMaxEffects: number;
  observedEffects: number;
  verdict: VerificationVerdict;
  executedAtUtc: string;
  executionDurationMs: number;
  timeline: VerificationTimelineEvent[];
  testSpriteAssertion: string;
  notes: string[];
}
