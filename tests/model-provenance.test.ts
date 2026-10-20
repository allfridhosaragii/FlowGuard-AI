/**
 * Regression tests for source attribution and comment-only false positives.
 * Source: FlowGuard AI PR #1, 20 October 2026.
 * Keep this test alongside existing tests; do NOT replace any existing tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../src/lib/ai/provider';
import { RequirementAgent } from '../src/lib/agents/requirement-agent';
import { RiskHunterAgent } from '../src/lib/agents/risk-agent';
import { AgentOrchestrator } from '../src/lib/agents/orchestrator';

const rule = 'A payment refund must be idempotent: one idempotency key produces at most one side effect.';
const vulnerable = `
async function refund(key) {
  const old = await db.findOne(key);
  await sleep(20);
  if (!old) await db.createRefund(key);
}`;

afterEach(() => vi.restoreAllMocks());

describe('Source provenance integrity', () => {
  it('Agent A reports heuristic provenance when a model returns invalid JSON', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: '<not JSON>', isRealModel: true, modelName: 'test/neural',
    });
    const result = await RequirementAgent.analyze(rule, undefined, vulnerable);
    expect(result.invariants.length).toBeGreaterThan(0);
    expect(result.isRealModel).toBe(false);
    expect(result.modelName).toMatch(/heuristic/i);
  });

  it('Agent A reports heuristic provenance when a model returns no usable invariants', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: '{"invariants":[]}', isRealModel: true, modelName: 'test/neural',
    });
    const result = await RequirementAgent.analyze(rule, undefined, vulnerable);
    expect(result.invariants.length).toBeGreaterThan(0);
    expect(result.isRealModel).toBe(false);
  });

  it('Agent B reports heuristic provenance when a model response is malformed', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: '{"unexpected":"shape"}', isRealModel: true, modelName: 'test/neural',
    });
    const inv = [RequirementAgent.fallbackInvariant(rule, vulnerable)];
    const result = await RiskHunterAgent.analyze(inv, vulnerable, ['src/refund.ts']);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.isRealModel).toBe(false);
    expect(result.modelName).toMatch(/heuristic/i);
  });

  it('Agent B retains neural provenance when valid JSON reports no findings', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: '{"findings":[]}', isRealModel: true, modelName: 'test/neural',
    });
    const inv = [RequirementAgent.fallbackInvariant(rule, vulnerable)];
    const result = await RiskHunterAgent.analyze(inv, vulnerable, ['src/refund.ts']);
    expect(result.findings).toEqual([]);
    expect(result.isRealModel).toBe(true);
    expect(result.modelName).toBe('test/neural');
  });

  it('comments alone do not invent race-condition risks', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const innocentCode = `
// await sleep(20) while refund balance is deducted
// findOne and createRefund were part of an earlier issue
export function add(a: number, b: number) { return a + b; }`;
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, innocentCode, ['src/math.ts']);
    expect(result.findings).toEqual([]);
    expect(result.isRealModel).toBe(false);
  });

  it('does not report a removed refund race as a current finding', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const patch = `diff --git a/src/refund.ts b/src/refund.ts
--- a/src/refund.ts
+++ b/src/refund.ts
@@ -1,4 +1,2 @@
-const existing = await db.refunds.findOne({ key });
-await sleep(20);
-if (!existing) await db.refunds.create({ key });
+return issueRefundWithIdempotency(key);`;
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, patch, ['src/refund.ts']);
    expect(result.findings).toEqual([]);
  });

  it('does not report a removed or commented JWT bypass', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const patch = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,3 +1,3 @@
-if (decoded.header.alg === 'none') return decoded.payload;
+// Removed unsafe algorithm bypass.
+return jwt.verify(token, secret);`;
    const inv = [RequirementAgent.fallbackInvariant('Token signatures must always be verified.')];
    const result = await RiskHunterAgent.analyze(inv, patch, ['src/auth.ts']);
    expect(result.findings).toEqual([]);
  });

  it('does not combine unrelated changes from separate files into a race finding', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const patch = `diff --git a/src/timer.ts b/src/timer.ts
--- a/src/timer.ts
+++ b/src/timer.ts
@@ -1 +1 @@
-await sleep(10);
+await sleep(20);
diff --git a/src/refund.ts b/src/refund.ts
--- a/src/refund.ts
+++ b/src/refund.ts
@@ -1 +1 @@
-return oldRefund;
+return refund;`;
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, patch, ['src/timer.ts', 'src/refund.ts']);
    expect(result.findings).toEqual([]);
  });

  it('attributes a multi-file diff finding to the vulnerable file', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const patch = `diff --git a/src/clean.ts b/src/clean.ts
--- a/src/clean.ts
+++ b/src/clean.ts
@@ -1 +1 @@
-return 1;
+return 2;
diff --git a/src/refund.ts b/src/refund.ts
--- a/src/refund.ts
+++ b/src/refund.ts
@@ -1 +1,3 @@
+const prior = await db.refunds.findOne({ key });
+await sleep(20);
+if (!prior) await db.refunds.create({ key });`;
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, patch, ['src/clean.ts', 'src/refund.ts']);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].sourcePaths).toEqual(['src/refund.ts']);
  });

  it('does not invent source line numbers for a manual snippet', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, vulnerable, ['src/refund.ts']);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].sourceLineRefs).toEqual([]);
  });

  it('cites the actual new-file hunk range for a diff finding', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const patch = `diff --git a/src/refund.ts b/src/refund.ts
--- a/src/refund.ts
+++ b/src/refund.ts
@@ -100,3 +207,3 @@
+const prior = await db.refunds.findOne({ key });
+await sleep(20);
+if (!prior) await db.refunds.create({ key });`;
    const inv = [RequirementAgent.fallbackInvariant(rule)];
    const result = await RiskHunterAgent.analyze(inv, patch, ['src/refund.ts']);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].sourceLineRefs).toEqual(['L207-L209']);
  });

  it('the pipeline exposes heuristic provenance on malformed neural responses', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(AIProvider, 'generateJSON').mockResolvedValue({
      content: 'not-json', isRealModel: true, modelName: 'test/neural',
    });
    const result = await AgentOrchestrator.run({
      sourceType: 'MANUAL_CODE', sourceReference: 'regression',
      businessRule: rule, codeDiff: vulnerable, filePaths: ['src/refund.ts'],
    });
    expect(result.isRealModel).toBe(false);
    expect(result.modelUsed).toMatch(/heuristic/i);
    expect(result.notes.some((note) => note.includes('Agent A provenance: heuristic'))).toBe(true);
    expect(result.notes.some((note) => note.includes('Agent B provenance: heuristic'))).toBe(true);
  });
});
