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

  const cleanDiff = `
diff --git a/src/math.ts b/src/math.ts
--- a/src/math.ts
+++ b/src/math.ts
@@ -1,4 +1,5 @@
+/** Adds two numbers together safely */
 export function add(a: number, b: number): number {
   return a + b;
 }
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

  it('Agent B (Regression against False Positives): returns 0 findings on clean/benign diff', async () => {
    const inv = (await RequirementAgent.analyze(sampleRule)).invariants;
    const res = await RiskHunterAgent.analyze(inv, cleanDiff, ['src/math.ts']);

    // Must NOT return generic false positives when evidence is absent!
    expect(res.findings.length).toBe(0);
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

  it('Agent C: generates an honest JWT-specific plan instead of refund verification for unsigned tokens', async () => {
    const res = await VerificationPlannerAgent.plan([], [{
      id: 'RISK-002',
      ruleId: 'INV-AUTH-001',
      severity: 'HIGH',
      sourcePaths: ['src/auth/jwt-service.ts'],
      sourceLineRefs: [],
      why: 'Cryptographic policy accepts unsigned JWT tokens using the "none" algorithm without signature validation.',
      counterexample: 'An attacker presents an unsigned JWT with admin claims.',
      status: 'POTENTIAL',
    }]);

    expect(res.plans).toHaveLength(1);
    expect(res.plans[0].findingId).toBe('RISK-002');
    expect(res.plans[0].testType).toBe('AUTH_STATE');
    expect(res.plans[0].supportState).toBe('UNSUPPORTED');
    expect(res.plans[0].fixtureId).toBeUndefined();
    expect(res.plans[0].inputVector.jwtAlgorithm).toBe('none');
    expect(res.plans[0].expectedEffects).toMatch(/unsigned JWTs|alg=none/);
    expect(res.plans[0].expectedEffects).not.toMatch(/refund|ledger/i);
  });

  it('Agent C: returns empty plans when findings are empty', async () => {
    const inv = (await RequirementAgent.analyze(sampleRule)).invariants;
    const res = await VerificationPlannerAgent.plan(inv, []);
    expect(res.plans.length).toBe(0);
  });

  it('AgentOrchestrator: runs full 6-stage pipeline and produces valid AnalysisResult for vulnerable code', async () => {
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

  it('AgentOrchestrator: produces NO_RISK_FOUND when code diff is benign', async () => {
    const result = await AgentOrchestrator.run({
      businessRule: sampleRule,
      sourceType: 'MANUAL_CODE',
      sourceReference: 'manual-clean-math',
      codeDiff: cleanDiff,
      filePaths: ['src/math.ts'],
    });

    expect(result.verdict).toBe('NO_RISK_FOUND');
    expect(result.findings.length).toBe(0);
    expect(result.plans.length).toBe(0);
  });

  it('AgentOrchestrator: accurately labels heuristic offline mode without claiming real AI', async () => {
    const result = await AgentOrchestrator.run({
      businessRule: sampleRule,
      sourceType: 'MANUAL_CODE',
      sourceReference: 'test',
      codeDiff: cleanDiff,
    });

    if (!result.isRealModel) {
      expect(result.modelUsed).toContain('heuristic');
      expect(result.notes.some((n) => n.includes('not configured'))).toBe(true);
    }
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

  describe('Domain Isolation & False-Positive Invariant Hardening', () => {
    const jwtRule =
      'JWT token verification must strictly validate expiration, cryptographic signature, and enforce algorithm integrity without bypass.';
    const paymentRule =
      'A settled payment can create at most one refund side effect for a given idempotency key, even under concurrent retries.';
    const arithmeticRule =
      'The add function must perform pure arithmetic addition of two numbers without external side effects or state mutations.';
    const arithmeticSnippet = `
export function add(a: number, b: number): number {
  return a + b;
}
`;
    const jwtSnippet = `
export function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  const decoded = jwt.decode(token, { complete: true });
  if (decoded.header.alg === 'none') {
    req.user = decoded.payload;
    return next();
  }
}
`;

    it('Context Isolation: arithmetic code with stale JWT rule extracts INV-MATH-001 and NEVER INV-AUTH-001', async () => {
      const res = await RequirementAgent.analyze(jwtRule, undefined, arithmeticSnippet);

      expect(res.invariants.length).toBeGreaterThanOrEqual(1);
      // Invariant MUST be arithmetic, not authentication!
      expect(res.invariants[0].id).toBe('INV-MATH-001');
      expect(res.invariants[0].scope).toContain('Arithmetic');
      expect(res.invariants.some((inv) => inv.id === 'INV-AUTH-001')).toBe(false);
      expect(res.domainMismatch).toBe(true);
      expect(res.mismatchNotice).toContain('Domain Notice:');
    });

    it('Context Isolation: arithmetic code with payment rule extracts INV-MATH-001 and NEVER INV-REFUND-001', async () => {
      const res = await RequirementAgent.analyze(paymentRule, undefined, arithmeticSnippet);

      expect(res.invariants.length).toBeGreaterThanOrEqual(1);
      expect(res.invariants[0].id).toBe('INV-MATH-001');
      expect(res.invariants.some((inv) => inv.id === 'INV-REFUND-001')).toBe(false);
      expect(res.domainMismatch).toBe(true);
    });

    it('Arithmetic snippet with matching arithmetic rule extracts INV-MATH-001 without mismatch', async () => {
      const res = await RequirementAgent.analyze(arithmeticRule, undefined, arithmeticSnippet);

      expect(res.invariants.length).toBeGreaterThanOrEqual(1);
      expect(res.invariants[0].id).toBe('INV-MATH-001');
      expect(res.domainMismatch).toBe(false);
    });

    it('JWT code with matching JWT rule extracts INV-AUTH-001 without mismatch', async () => {
      const res = await RequirementAgent.analyze(jwtRule, undefined, jwtSnippet);

      expect(res.invariants.length).toBeGreaterThanOrEqual(1);
      expect(res.invariants[0].id).toBe('INV-AUTH-001');
      expect(res.domainMismatch).toBe(false);
    });

    it('End-to-End Orchestrator: benign arithmetic code produces 0 findings, NO_RISK_FOUND, and no auth invariants even if rule is JWT', async () => {
      const result = await AgentOrchestrator.run({
        businessRule: jwtRule,
        sourceType: 'MANUAL_CODE',
        sourceReference: 'arithmetic-benign',
        codeDiff: arithmeticSnippet,
        filePaths: ['src/math/arithmetic.ts'],
      });

      expect(result.verdict).toBe('NO_RISK_FOUND');
      expect(result.findings.length).toBe(0);
      expect(result.plans.length).toBe(0);
      expect(result.invariants.length).toBeGreaterThanOrEqual(1);
      expect(result.invariants[0].id).toBe('INV-MATH-001');
      // Critical assertion: NO INV-AUTH-001 in result!
      expect(result.invariants.some((inv) => inv.id.includes('AUTH'))).toBe(false);
      expect(result.notes.some((n) => n.includes('Domain Notice:'))).toBe(true);
    });

    it('End-to-End Orchestrator: vulnerable JWT code produces POTENTIAL finding (RISK-002) with INV-AUTH-001', async () => {
      const result = await AgentOrchestrator.run({
        businessRule: jwtRule,
        sourceType: 'MANUAL_CODE',
        sourceReference: 'jwt-vulnerable',
        codeDiff: jwtSnippet,
        filePaths: ['src/auth/jwt-service.ts'],
      });

      expect(result.verdict).toBe('POTENTIAL');
      expect(result.findings.length).toBeGreaterThanOrEqual(1);
      expect(result.findings[0].id).toBe('RISK-002');
      expect(result.invariants[0].id).toBe('INV-AUTH-001');
      expect(result.plans[0].testType).toBe('AUTH_STATE');
      expect(result.plans[0].supportState).toBe('UNSUPPORTED');
      expect(result.plans[0].expectedEffects).toMatch(/JWT|alg=none/);
    });
  });
});
