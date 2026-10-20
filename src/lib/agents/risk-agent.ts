import { AIProvider } from '../ai/provider';
import { BusinessInvariant, RiskFinding, RiskFindingSchema } from '../schemas/agent-schemas';

function hunkLineRefs(diff: string): string[] {
  return [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)].flatMap((match) => {
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    if (count === 0) return [];
    return [count === 1 ? `L${start}` : `L${start}-L${start + count - 1}`];
  });
}

export class RiskHunterAgent {
  public static async analyze(
    invariants: BusinessInvariant[],
    codeDiff: string,
    filePaths: string[]
  ): Promise<{ findings: RiskFinding[]; isRealModel: boolean; modelName: string }> {
    const isConfigured = AIProvider.isConfigured();

    if (isConfigured) {
      const systemPrompt = `You are Agent B (Risk Hunter) for FlowGuard AI.
Analyze the provided code diff strictly against the specified business invariants.
CRITICAL RULES:
1. Every finding MUST have status "POTENTIAL" (never claim a bug is verified without execution evidence).
2. If the diff does NOT contain sufficient evidence of an invariant violation (e.g. benign refactoring, comments, formatting, or safe synchronous logic), return an EMPTY findings array: {"findings": []}.
3. DO NOT fabricate generic risks when evidence is insufficient.
4. Output valid JSON matching:
{
  "findings": [
    {
      "id": "RISK-001",
      "ruleId": "INV-001",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "sourcePaths": ["path/to/file.ts"],
      "sourceLineRefs": ["L15-L25"],
      "why": "Specific technical explanation of how the code violates the invariant",
      "counterexample": "Concrete scenario where this causes failure",
      "status": "POTENTIAL"
    }
  ]
}`;

      const userPrompt = `Business Invariants to evaluate:
${JSON.stringify(invariants, null, 2)}

Target Code Diff:
${codeDiff.slice(0, 15000)}

Changed Files:
${filePaths.join('\n')}`;

      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content) as { findings?: Record<string, unknown>[] };
        if (!Array.isArray(parsed.findings)) {
          throw new Error('Risk model response missing findings array');
        }
        const findings = parsed.findings.map((f, idx: number) =>
          RiskFindingSchema.parse({
            id: f.id || `RISK-${String(idx + 1).padStart(3, '0')}`,
            ruleId: f.ruleId || invariants[0]?.id || 'INV-001',
            severity: f.severity || 'HIGH',
            sourcePaths: Array.isArray(f.sourcePaths) ? f.sourcePaths : filePaths.slice(0, 1),
            sourceLineRefs: Array.isArray(f.sourceLineRefs) ? f.sourceLineRefs : hunkLineRefs(codeDiff),
            why: f.why || 'Potential invariant violation detected.',
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
          isRealModel: false,
          modelName: 'deterministic-heuristic-v1 (invalid model output)',
        };
      }
    }

    // Explicit Offline Heuristic Scanner
    return {
      findings: this.heuristicScan(invariants, codeDiff, filePaths),
      isRealModel: false,
      modelName: 'deterministic-heuristic-v1',
    };
  }

  /**
   * Deterministic Heuristic Scanner
   * Evaluates concrete structural patterns in the diff.
   * NEVER returns generic placeholder findings if evidence is absent.
   */
  private static heuristicScan(
    invariants: BusinessInvariant[],
    codeDiff: string,
    filePaths: string[]
  ): RiskFinding[] {
    const filePatches = codeDiff.split(/(?=^diff --git )/m).filter((part) => part.startsWith('diff --git '));
    if (filePatches.length > 1) {
      const findings = filePatches.flatMap((patch, index) => {
        const path = patch.match(/^diff --git a\/.+? b\/(.+)$/m)?.[1] || filePaths[index];
        return this.heuristicScan(invariants, patch, path ? [path] : []);
      });
      return findings.map((finding, index) => ({
        ...finding,
        id: `RISK-${String(index + 1).padStart(3, '0')}`,
      }));
    }

    const findings: RiskFinding[] = [];
    const inv = invariants[0] || { id: 'INV-001' };
    const sourceLineRefs = hunkLineRefs(codeDiff);

    // In a unified diff, removed lines describe the old implementation. Scan
    // only the new-side hunk (added and context lines), never diff metadata.
    const isUnifiedDiff = /^(?:diff --git |@@ )/m.test(codeDiff);
    let inHunk = false;
    const targetCode = isUnifiedDiff
      ? codeDiff.split(/\r?\n/).flatMap((line) => {
          if (line.startsWith('diff --git ')) inHunk = false;
          if (line.startsWith('@@ ')) {
            inHunk = true;
            return [];
          }
          return inHunk && (line.startsWith('+') || line.startsWith(' '))
            ? [line.slice(1)]
            : [];
        }).join('\n')
      : codeDiff;

    // Strip comments BEFORE every risk signal check. This remains a bounded
    // heuristic scanner, not a full parser for every source language.
    const codeWithoutComments = targetCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    // Pattern 1: Concurrency Race / Non-atomic read before write in state-modifying code
    const hasAsyncGap =
      /setTimeout|sleep|await\s+new\s+Promise/i.test(codeWithoutComments) ||
      (/findOne|findById|select.*from/i.test(codeWithoutComments) && /create|insert|update|save/i.test(codeWithoutComments));

    const hasStateMutation =
      /refund|settle|transfer|deduct|balance|withdraw|charge/i.test(codeWithoutComments);

    const hasLockingProtection =
      /\.lock\s*\(|acquireLock|inFlightClaims|mutex|atomic\w+|transaction\(|isolation:\s*['"]serializable['"]|pessimistic/i.test(
        codeWithoutComments
      );

    if (hasAsyncGap && hasStateMutation && !hasLockingProtection) {
      findings.push({
        id: 'RISK-001',
        ruleId: inv.id,
        severity: 'CRITICAL',
        sourcePaths: filePaths.length > 0 ? [filePaths[0]] : ['src/payment/service.ts'],
        sourceLineRefs,
        why: 'Asynchronous state check is decoupled from the state write without atomic locking or distributed reservation. Concurrent requests can read uncommitted state and cause duplicate side effects.',
        counterexample:
          'Two concurrent requests with the identical idempotency key arrive within the async window; both pass the existence check and each commits a duplicate refund.',
        status: 'POTENTIAL',
      });
    }

    // Pattern 2: Cryptographic signature bypass or algorithm "none"
    const hasJwtNoneBypass =
      /alg\s*===\s*['"]none['"]|algorithm:\s*['"]none['"]|verify\s*:\s*false/i.test(codeWithoutComments);

    if (hasJwtNoneBypass) {
      findings.push({
        id: 'RISK-002',
        ruleId: inv.id,
        severity: 'HIGH',
        sourcePaths: filePaths.length > 0 ? [filePaths[0]] : ['src/auth/middleware.ts'],
        sourceLineRefs,
        why: 'Cryptographic policy accepts unsigned JWT tokens using the "none" algorithm without signature validation.',
        counterexample:
          'An unauthenticated caller provides an unsigned JWT with administrative claims, bypassing authorization checks.',
        status: 'POTENTIAL',
      });
    }

    // NOTE: If no concrete vulnerability pattern matches, return EMPTY findings array.
    // We intentionally DO NOT inject generic catch-all findings.
    return findings;
  }
}
