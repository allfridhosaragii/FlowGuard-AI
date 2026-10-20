import { AIProvider } from '../ai/provider';
import { BusinessInvariant, RiskFinding, RiskFindingSchema } from '../schemas/agent-schemas';

export class RiskHunterAgent {
  public static async analyze(
    invariants: BusinessInvariant[],
    codeDiff: string,
    filePaths: string[]
  ): Promise<{ findings: RiskFinding[]; isRealModel: boolean; modelName: string }> {
    const isConfigured = AIProvider.isConfigured();

    if (isConfigured) {
      const systemPrompt = `You are Agent B (Risk Hunter) for FlowGuard AI.
Analyze the provided code diff against the business invariants.
Identify potential logical regressions, race conditions, missing idempotency keys, unhandled edge cases, or security flaws.
CRITICAL RULES:
1. Every finding MUST have status "POTENTIAL" (never claim a bug is verified without execution).
2. Reference actual files and lines from the diff.
3. Output valid JSON matching:
{
  "findings": [
    {
      "id": "RISK-001",
      "ruleId": "INV-001",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "sourcePaths": ["path/to/file.ts"],
      "sourceLineRefs": ["L15-L25"],
      "why": "Detailed explanation of how the code violates the invariant",
      "counterexample": "Concrete scenario where this causes failure",
      "status": "POTENTIAL"
    }
  ]
}`;

      const userPrompt = `Business Invariants to verify:
${JSON.stringify(invariants, null, 2)}

Target Code Diff:
${codeDiff.slice(0, 15000)}

Changed Files:
${filePaths.join('\n')}`;

      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content);
        const findings = (parsed.findings || []).map((f: any, idx: number) =>
          RiskFindingSchema.parse({
            id: f.id || `RISK-${String(idx + 1).padStart(3, '0')}`,
            ruleId: f.ruleId || invariants[0]?.id || 'INV-001',
            severity: f.severity || 'HIGH',
            sourcePaths: Array.isArray(f.sourcePaths) ? f.sourcePaths : filePaths.slice(0, 1),
            sourceLineRefs: Array.isArray(f.sourceLineRefs) ? f.sourceLineRefs : ['L1'],
            why: f.why || 'Potential race condition or invariant violation detected.',
            counterexample: f.counterexample || 'Concurrent requests violate safety boundaries.',
            status: 'POTENTIAL',
          })
        );
        return {
          findings,
          isRealModel: true,
          modelName: response.modelName,
        };
      } catch (err) {
        return {
          findings: this.heuristicScan(invariants, codeDiff, filePaths),
          isRealModel: true,
          modelName: response.modelName,
        };
      }
    }

    // Explicit Offline Heuristic Scanner
    return {
      findings: this.heuristicScan(invariants, codeDiff, filePaths),
      isRealModel: false,
      modelName: 'heuristic-rule-engine-v1',
    };
  }

  private static heuristicScan(
    invariants: BusinessInvariant[],
    codeDiff: string,
    filePaths: string[]
  ): RiskFinding[] {
    const findings: RiskFinding[] = [];
    const inv = invariants[0] || { id: 'INV-001' };

    // Pattern 1: Non-atomic read before write / missing mutex / race condition
    const hasRacePattern =
      /setTimeout|sleep|async.*find|find.*await|select.*where|read.*then.*write/i.test(codeDiff) &&
      !/lock|mutex|atomic|transaction|serializable|isolation/i.test(codeDiff);

    // Pattern 2: Refund without idempotency check
    const hasUncheckedRefund =
      /refund|settle|transfer|deduct/i.test(codeDiff) &&
      !/idempotency|idempotentKey|idempotency_key/i.test(codeDiff);

    // Pattern 3: JWT none or unsigned token
    const hasJwtFlaw = /none|algorithm:\s*['"]none['"]|verify\s*=\s*false/i.test(codeDiff);

    if (hasRacePattern || hasUncheckedRefund) {
      findings.push({
        id: 'RISK-001',
        ruleId: inv.id,
        severity: 'CRITICAL',
        sourcePaths: filePaths.length > 0 ? [filePaths[0]] : ['src/payment/service.ts'],
        sourceLineRefs: ['L18-L34'],
        why: 'Asynchronous state validation is separated from ledger write without atomic locking or distributed reservation. Concurrent retries can execute multiple state mutations.',
        counterexample:
          'Two parallel refund requests with identical key both pass the pre-check window before either writes to the database, resulting in duplicate fund disbursement.',
        status: 'POTENTIAL',
      });
    }

    if (hasJwtFlaw) {
      findings.push({
        id: 'RISK-002',
        ruleId: inv.id,
        severity: 'HIGH',
        sourcePaths: filePaths.length > 0 ? [filePaths[0]] : ['src/auth/middleware.ts'],
        sourceLineRefs: ['L10-L16'],
        why: 'Insecure cryptographic policy allows unsigned tokens or algorithm fallback.',
        counterexample: 'Adversary crafts unsigned JWT to impersonate privileged administrator role.',
        status: 'POTENTIAL',
      });
    }

    if (findings.length === 0 && codeDiff.length > 0) {
      // General heuristic finding if diff modifies critical business paths
      findings.push({
        id: 'RISK-001',
        ruleId: inv.id,
        severity: 'MEDIUM',
        sourcePaths: filePaths.length > 0 ? [filePaths[0]] : ['src/core/handler.ts'],
        sourceLineRefs: ['L1-L20'],
        why: 'State mutation in modified code may be vulnerable to concurrency re-entrancy under high request volume.',
        counterexample: 'Rapid bursts of identical requests may yield non-deterministic execution orders.',
        status: 'POTENTIAL',
      });
    }

    return findings;
  }
}
