import { AIProvider } from '../ai/provider';
import { BusinessInvariant, RiskFinding, RiskFindingSchema } from '../schemas/agent-schemas';

type EvidenceLine = { kind: 'added' | 'context'; lineNumber?: number; text: string };
type EvidenceHunk = { newStart?: number; newCount?: number; lines: EvidenceLine[] };
type EvidenceFile = { path?: string; hunks: EvidenceHunk[] };
type AnalysisEvidence = { isUnifiedDiff: boolean; files: EvidenceFile[] };

function parseEvidence(code: string, filePaths: string[]): AnalysisEvidence {
  const isUnifiedDiff = /^(?:diff --git |@@ )/m.test(code);
  if (!isUnifiedDiff) {
    return { isUnifiedDiff: false, files: [{ hunks: [{
      lines: code.split(/\r?\n/).map((text) => ({ kind: 'added', text })),
    }] }] };
  }

  const chunks = code.split(/(?=^diff --git )/m).filter((chunk) => chunk.trim());
  const patches = chunks.some((chunk) => chunk.startsWith('diff --git '))
    ? chunks.filter((chunk) => chunk.startsWith('diff --git ')) : [code];
  const files = patches.map((patch, fileIndex): EvidenceFile => {
    const path = patch.match(/^diff --git .+ b\/(.+)$/m)?.[1]
      || patch.match(/^\+\+\+ b\/(.+)$/m)?.[1] || filePaths[fileIndex];
    const hunks: EvidenceHunk[] = [];
    let current: EvidenceHunk | undefined;
    let newLine = 0;
    for (const line of patch.split(/\r?\n/)) {
      const header = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      if (header) {
        current = { newStart: Number(header[1]), newCount: Number(header[2] ?? 1), lines: [] };
        hunks.push(current);
        newLine = current.newStart!;
      } else if (current && line.startsWith('+') && !line.startsWith('+++')) {
        current.lines.push({ kind: 'added', lineNumber: newLine++, text: line.slice(1) });
      } else if (current && line.startsWith(' ')) {
        current.lines.push({ kind: 'context', lineNumber: newLine++, text: line.slice(1) });
      } else if (current && !line.startsWith('-') && !line.startsWith('\\ No newline')) {
        current = undefined;
      }
    }
    return { path, hunks };
  });
  return { isUnifiedDiff: true, files };
}

function activeCode(hunk: EvidenceHunk): string {
  return hunk.lines.map((line) => line.text).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function hunkLineRefs(hunk: EvidenceHunk): string[] {
  const numbers = hunk.lines.flatMap((line) => line.lineNumber === undefined ? [] : [line.lineNumber]);
  if (!numbers.length) return [];
  const start = Math.min(...numbers);
  const end = Math.max(...numbers);
  return [start === end ? `L${start}` : `L${start}-L${end}`];
}

function activeLines(file: EvidenceFile): Set<number> {
  return new Set(file.hunks.flatMap((hunk) => hunk.lines.flatMap((line) =>
    line.lineNumber === undefined ? [] : [line.lineNumber]
  )));
}

function validLineRefs(refs: unknown[], allowed: Set<number>): refs is string[] {
  return refs.every((ref) => {
    if (typeof ref !== 'string') return false;
    const match = ref.match(/^L(\d+)(?:-L(\d+))?$/);
    if (!match) return false;
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (end < start) return false;
    for (let line = start; line <= end; line++) if (!allowed.has(line)) return false;
    return true;
  });
}

function assignUniqueFindingIds(findings: RiskFinding[]): RiskFinding[] {
  const usedIds = new Set<string>();

  return findings.map((finding, index) => {
    const baseId = finding.id.trim() || `RISK-${String(index + 1).padStart(3, '0')}`;
    let id = baseId;
    let duplicateNumber = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${duplicateNumber++}`;
    }
    usedIds.add(id);
    return { ...finding, id };
  });
}

export class RiskHunterAgent {
  public static async analyze(
    invariants: BusinessInvariant[], codeDiff: string, filePaths: string[]
  ): Promise<{ findings: RiskFinding[]; isRealModel: boolean; modelName: string }> {
    const evidence = parseEvidence(codeDiff, filePaths);
    if (AIProvider.isConfigured()) {
      const systemPrompt = `You are Agent B (Risk Hunter) for FlowGuard AI.
Analyze only the structured active new-side evidence against the business invariants. Added and context lines use new-file coordinates. Deleted lines and diff metadata are absent.
CRITICAL RULES:
1. Every finding MUST have status "POTENTIAL".
2. If active evidence is insufficient, return {"findings": []}.
3. Do not fabricate risks, paths, line references, deleted behavior, or old-file behavior.
4. Cite only paths and new-file lines present in the evidence.
5. Output JSON with a findings array. Each finding has id, ruleId, severity, sourcePaths, sourceLineRefs, why, counterexample, and status.`;
      const normalizedEvidence = {
        kind: evidence.isUnifiedDiff ? 'unified-diff-active-new-side' : 'manual-snippet',
        files: evidence.files.map((file) => ({ path: file.path ?? null, hunks: file.hunks.map((hunk) => ({
          newStart: hunk.newStart ?? null, newCount: hunk.newCount ?? null, lines: hunk.lines,
        })) })),
      };
      const userPrompt = `Business Invariants to evaluate:\n${JSON.stringify(invariants, null, 2)}\n\nStructured Active Evidence:\n${JSON.stringify(normalizedEvidence, null, 2)}`;
      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content) as { findings?: Record<string, unknown>[] };
        if (!Array.isArray(parsed.findings)) throw new Error('Risk model response missing findings array');
        let rejected = false;
        const findings = parsed.findings.flatMap((finding, idx): RiskFinding[] => {
          const solePath = evidence.files.length === 1 ? evidence.files[0].path : undefined;
          const sourcePaths = Array.isArray(finding.sourcePaths) ? finding.sourcePaths : (solePath ? [solePath] : []);
          if (!sourcePaths.every((path): path is string => typeof path === 'string'
            && evidence.files.some((file) => file.path === path))) {
            rejected = true;
            return [];
          }
          const sourceLineRefs = Array.isArray(finding.sourceLineRefs) ? finding.sourceLineRefs : [];
          const citedFiles = sourcePaths.length
            ? evidence.files.filter((file) => sourcePaths.includes(file.path || '')) : evidence.files;
          const allowed = new Set(citedFiles.flatMap((file) => [...activeLines(file)]));
          if (!validLineRefs(sourceLineRefs, allowed)) {
            rejected = true;
            return [];
          }
          return [RiskFindingSchema.parse({
            id: finding.id || `RISK-${String(idx + 1).padStart(3, '0')}`,
            ruleId: finding.ruleId || invariants[0]?.id || 'INV-001', severity: finding.severity || 'HIGH',
            sourcePaths, sourceLineRefs, why: finding.why || 'Potential invariant violation detected.',
            counterexample: finding.counterexample || 'Concurrent requests violate safety boundaries.', status: 'POTENTIAL',
          })];
        });
        if (parsed.findings.length && !findings.length && rejected) {
          return { findings: this.heuristicScan(invariants, evidence), isRealModel: false,
            modelName: 'deterministic-heuristic-v1 (model findings lacked active evidence)' };
        }
        return { findings: assignUniqueFindingIds(findings), isRealModel: true, modelName: response.modelName };
      } catch {
        return { findings: this.heuristicScan(invariants, evidence), isRealModel: false,
          modelName: 'deterministic-heuristic-v1 (invalid model output)' };
      }
    }
    return { findings: this.heuristicScan(invariants, evidence), isRealModel: false,
      modelName: 'deterministic-heuristic-v1' };
  }

  private static heuristicScan(invariants: BusinessInvariant[], evidence: AnalysisEvidence): RiskFinding[] {
    const findings: RiskFinding[] = [];
    const inv = invariants[0] || { id: 'INV-001' };
    for (const file of evidence.files) for (const hunk of file.hunks) {
      const code = activeCode(hunk);
      const hasAsyncGap = /setTimeout|sleep|await\s+new\s+Promise/i.test(code)
        || (/findOne|findById|select.*from/i.test(code) && /create|insert|update|save/i.test(code));
      const hasMutation = /refund|settle|transfer|deduct|balance|withdraw|charge/i.test(code);
      const protectedWrite = /\.lock\s*\(|acquireLock|inFlightClaims|mutex|atomic\w+|transaction\(|isolation:\s*['"]serializable['"]|pessimistic/i.test(code);
      const sourcePaths = file.path ? [file.path] : [];
      const sourceLineRefs = evidence.isUnifiedDiff ? hunkLineRefs(hunk) : [];
      if (hasAsyncGap && hasMutation && !protectedWrite) findings.push({
        id: 'RISK-001', ruleId: inv.id, severity: 'CRITICAL', sourcePaths, sourceLineRefs,
        why: 'Asynchronous state check is decoupled from the state write without atomic locking or distributed reservation. Concurrent requests can read uncommitted state and cause duplicate side effects.',
        counterexample: 'Two concurrent requests with the identical idempotency key arrive within the async window; both pass the existence check and each commits a duplicate refund.', status: 'POTENTIAL',
      });
      if (/alg\s*===\s*['"]none['"]|algorithm:\s*['"]none['"]|verify\s*:\s*false/i.test(code)) findings.push({
        id: 'RISK-002', ruleId: inv.id, severity: 'HIGH', sourcePaths, sourceLineRefs,
        why: 'Cryptographic policy accepts unsigned JWT tokens using the "none" algorithm without signature validation.',
        counterexample: 'An unauthenticated caller provides an unsigned JWT with administrative claims, bypassing authorization checks.', status: 'POTENTIAL',
      });
    }
    return assignUniqueFindingIds(findings);
  }
}
