import { describe, it, expect } from 'vitest';
import { RequirementAgent } from '../src/lib/agents/requirement-agent';
import { RiskHunterAgent } from '../src/lib/agents/risk-agent';
import { VerificationPlannerAgent } from '../src/lib/agents/verification-agent';
import { AgentOrchestrator } from '../src/lib/agents/orchestrator';

describe('Multi-Agent Analysis Pipeline', () => {
  const sampleRule =
    'A settled payment can create at most one refund side effect for a given idempotency key, even under concurrent retries.';

  const vulnerableDiff = `
diff --git a/src/refund.ts b/src/refund.ts
--- a/src/refund.ts
+++ b/src/refund.ts
@@ -10,6 +10,12 @@
+  const existing = await db.find(key);
+  if (!existing) {
+    await sleep(20); // simulate async I/O without lock
+    await db.insertRefund(key, amount);
+  }
`;

  it('Agent A: extracts formal invariants and acceptance criteria', async () => {
    const res = await RequirementAgent.analyze(sampleRule);
    expect(res.invariants.length).toBeGreaterThanOrEqual(1);
    expect(res.invariants[0].id).toBe('INV-REFUND-001');
    expect(res.invariants[0].predicate).toContain('count(');
  });

  it('Agent B: identifies concurrency race vulnerability as POTENTIAL finding', async () => {
    const inv = (await RequirementAgent.analyze(sampleRule)).invariants;
    const res = await RiskHunterAgent.analyze(inv, vulnerableDiff, ['src/refund.ts']);

    expect(res.findings.length).toBeGreaterThanOrEqual(1);
    expect(res.findings[0].severity).toBe('CRITICAL');
    expect(res.findings[0].status).toBe('POTENTIAL'); // MUST always be POTENTIAL
    expect(res.findings[0].counterexample).toBeTruthy();
  });

  it('Agent C: synthesizes supported verification plan for idempotency finding', async () => {
    const inv = (await RequirementAgent.analyze(sampleRule)).invariants;
    const findings = (await RiskHunterAgent.analyze(inv, vulnerableDiff, ['src/refund.ts'])).findings;
    const res = await VerificationPlannerAgent.plan(inv, findings);

    expect(res.plans.length).toBeGreaterThanOrEqual(1);
    expect(res.plans[0].testType).toBe('IDEMPOTENCY_CONCURRENCY');
    expect(res.plans[0].supportState).toBe('SUPPORTED');
    expect(res.plans[0].fixtureId).toBe('refund-vulnerable-v1');
  });

  it('AgentOrchestrator: runs full 6-stage pipeline and produces valid AnalysisResult', async () => {
    const result = await AgentOrchestrator.run({
      businessRule: sampleRule,
      sourceType: 'MANUAL_CODE',
      sourceReference: 'manual-snippet-01',
      codeDiff: vulnerableDiff,
      filePaths: ['src/refund.ts'],
    });

    expect(result.runId).toMatch(/^analysis_/);
    expect(result.stages.length).toBe(6);
    expect(result.stages.every((s) => s.status === 'SUCCESS')).toBe(true);
    expect(result.verdict).toBe('POTENTIAL');
    expect(result.invariants.length).toBeGreaterThanOrEqual(1);
    expect(result.findings.length).toBeGreaterThanOrEqual(1);
    expect(result.plans.length).toBeGreaterThanOrEqual(1);
    expect(result.notes.some((n) => n.includes('POTENTIAL'))).toBe(true);
  });

  it('AgentOrchestrator: rejects invalid short business rule (<10 chars)', async () => {
    await expect(
      AgentOrchestrator.run({
        businessRule: 'short',
        sourceType: 'MANUAL_CODE',
        sourceReference: 'err',
      })
    ).rejects.toThrow(/at least 10 characters/);
  });
});
