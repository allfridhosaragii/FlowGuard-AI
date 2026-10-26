import { z } from 'zod';

export const BusinessInvariantSchema = z.object({
  id: z.string(),
  humanText: z.string(),
  predicate: z.string(),
  scope: z.string(),
  assumptions: z.array(z.string()),
});
export type BusinessInvariant = z.infer<typeof BusinessInvariantSchema>;

export const RiskFindingSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  sourcePaths: z.array(z.string()),
  sourceLineRefs: z.array(z.string()),
  why: z.string(),
  counterexample: z.string(),
  status: z.literal('POTENTIAL'),
});
export type RiskFinding = z.infer<typeof RiskFindingSchema>;

export const VerificationPlanSchema = z.object({
  findingId: z.string(),
  testType: z.enum([
    'IDEMPOTENCY_CONCURRENCY',
    'BOUNDARY_CHECK',
    'AUTH_STATE',
    'UNSUPPORTED',
  ]),
  fixtureId: z.string().optional(),
  inputVector: z.record(z.string(), z.any()),
  expectedEffects: z.string(),
  supportState: z.enum(['SUPPORTED', 'UNSUPPORTED']),
});
export type VerificationPlan = z.infer<typeof VerificationPlanSchema>;

export const StageTraceSchema = z.object({
  stage: z.enum([
    'VALIDATING_INPUT',
    'FETCHING_CONTEXT',
    'EXTRACTING_RULE',
    'RISK_ANALYSIS',
    'PLANNING_CHECK',
    'COMPLETED',
  ]),
  status: z.enum(['SUCCESS', 'FAILED', 'SKIPPED']),
  durationMs: z.number(),
  agentName: z.string(),
  summary: z.string(),
});
export type StageTrace = z.infer<typeof StageTraceSchema>;

export const SourceFetchStatusSchema = z.enum(['LIVE_FETCH', 'CACHED', 'FALLBACK_USED', 'NOT_APPLICABLE', 'UNKNOWN']);
export type SourceFetchStatus = z.infer<typeof SourceFetchStatusSchema>;

export const AnalysisResultSchema = z.object({
  runId: z.string(),
  sourceType: z.enum(['GITHUB_PR', 'MANUAL_CODE']),
  sourceReference: z.string(),
  // Explicit provenance; optional for backwards-compatible older reports.
  selectedPrUrl: z.string().url().nullable().optional(),
  prFetchStatus: SourceFetchStatusSchema.optional(),
  sourceSha: z.string(),
  businessRule: z.string(),
  invariants: z.array(BusinessInvariantSchema),
  findings: z.array(RiskFindingSchema),
  plans: z.array(VerificationPlanSchema),
  stages: z.array(StageTraceSchema),
  modelUsed: z.string(),
  isRealModel: z.boolean(),
  verdict: z.enum(['POTENTIAL', 'NO_RISK_FOUND', 'INCONCLUSIVE', 'ERROR']),
  executedAtUtc: z.string(),
  notes: z.array(z.string()),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
