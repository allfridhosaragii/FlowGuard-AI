/**
 * FlowGuard AI — minimal, auditable corrective patch for provenance truthfulness.
 * Baseline: PR #1 head b6375a7 (20 October 2026).
 * Run in repository root: node scripts/apply-model-provenance-fix.mjs
 *
 * This tool never stages, commits, pushes, merges, or changes tests by itself.
 * All preconditions are checked BEFORE any source file is written.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const expectedBranch = 'feat/testsprite-s4-hardening';
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (branch !== expectedBranch) {
  throw new Error(`Wrong branch: ${branch}. Expected ${expectedBranch}. Do not patch main.`);
}

const expectedFiles = {
  requirement: 'src/lib/agents/requirement-agent.ts',
  risk: 'src/lib/agents/risk-agent.ts',
  orchestrator: 'src/lib/agents/orchestrator.ts',
};
const source = {};
for (const [name, relative] of Object.entries(expectedFiles)) {
  const path = resolve(relative);
  if (!existsSync(path)) throw new Error(`File missing: ${relative}`);
  source[name] = readFileSync(path, 'utf8');
}
const edited = { ...source };
const changes = [];
function replaceOne(name, before, after, label) {
  const count = edited[name].split(before).length - 1;
  if (count !== 1) throw new Error(`Preflight failed for ${label}: expected 1 exact match, found ${count}. Files remain unchanged.`);
  edited[name] = edited[name].replace(before, after);
  changes.push(label);
}

replaceOne('requirement',
`          invariants: invariants.length > 0 ? invariants : [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: true,
          modelName: response.modelName,`,
`          invariants: invariants.length > 0 ? invariants : [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: invariants.length > 0,
          modelName: invariants.length > 0
            ? response.modelName
            : 'heuristic-rule-engine-v1 (model returned no usable invariants)',`,
'Agent A: empty/unusable neural output is honestly labeled heuristic');

replaceOne('requirement',
`          invariants: [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: true,
          modelName: response.modelName,`,
`          invariants: [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: false,
          modelName: 'heuristic-rule-engine-v1 (invalid model output)',`,
'Agent A: parse/schema failure is honestly labeled heuristic');

replaceOne('risk',
`        const parsed = JSON.parse(response.content);
        const findings = (parsed.findings || []).map((f: any, idx: number) =>`,
`        const parsed = JSON.parse(response.content);
        if (!Array.isArray(parsed.findings)) {
          throw new Error('Risk model response missing findings array');
        }
        const findings = parsed.findings.map((f: any, idx: number) =>`,
'Agent B: malformed neural response is rejected');

replaceOne('risk',
`          findings: this.heuristicScan(invariants, codeDiff, filePaths),
          isRealModel: true,
          modelName: response.modelName,`,
`          findings: this.heuristicScan(invariants, codeDiff, filePaths),
          isRealModel: false,
          modelName: 'deterministic-heuristic-v1 (invalid model output)',`,
'Agent B: actual fallback findings are not claimed as neural results');

replaceOne('risk',
`    // Pattern 1: Concurrency Race / Non-atomic read before write in state-modifying code
    const hasAsyncGap =
      /setTimeout|sleep|await\\s+new\\s+Promise/i.test(codeDiff) ||
      (/findOne|findById|select.*from/i.test(codeDiff) && /create|insert|update|save/i.test(codeDiff));

    const hasStateMutation =
      /refund|settle|transfer|deduct|balance|withdraw|charge/i.test(codeDiff);

    // Strip comments to ensure explanatory notes like "// without lock" don't falsely mask the risk
    const codeWithoutComments = codeDiff
      .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
      .replace(/\\/\\/.*$/gm, '');`,
`    // Strip comments BEFORE risk signal detection so comments cannot fabricate findings.
    // This is still a bounded heuristic scanner, not a full AST parser.
    const codeWithoutComments = codeDiff
      .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
      .replace(/\\/\\/.*$/gm, '');

    // Pattern 1: Concurrency Race / Non-atomic read before write in state-modifying code
    const hasAsyncGap =
      /setTimeout|sleep|await\\s+new\\s+Promise/i.test(codeWithoutComments) ||
      (/findOne|findById|select.*from/i.test(codeWithoutComments) && /create|insert|update|save/i.test(codeWithoutComments));

    const hasStateMutation =
      /refund|settle|transfer|deduct|balance|withdraw|charge/i.test(codeWithoutComments);`,
'Agent B: comment-only vulnerability markers cannot create findings');

replaceOne('orchestrator',
`    const isRealModel = reqResult.isRealModel || riskResult.isRealModel;
    const modelUsed = reqResult.modelName;

    if (!isRealModel) {
      notes.push(
        'Server-side LLM_API_KEY is not configured in this environment. Analysis was performed using deterministic heuristic rule checking. Results are labeled as heuristic.'
      );
    } else {
      notes.push(\`Neural inference executed via model: \${modelUsed}.\`);
    }`,
`    const neuralModels = [reqResult, riskResult]
      .filter((result) => result.isRealModel)
      .map((result) => result.modelName);
    const isRealModel = neuralModels.length > 0;
    const modelUsed = isRealModel
      ? [...new Set(neuralModels)].join(' + ')
      : 'deterministic-heuristic-v1';

    // Provenance is per-agent: a successful neural call in one agent does
    // not magically make the other agent's fallback output neural.
    notes.push(\`Agent A provenance: \${reqResult.isRealModel ? 'neural' : 'heuristic'} (\${reqResult.modelName}).\`);
    notes.push(\`Agent B provenance: \${riskResult.isRealModel ? 'neural' : 'heuristic'} (\${riskResult.modelName}).\`);
    if (!isRealModel) {
      notes.push(
        'Neural model output was not used (model not configured or model output invalid). Analysis was performed using deterministic heuristic rule checking.'
      );
    } else if (!reqResult.isRealModel || !riskResult.isRealModel) {
      notes.push('Mixed provenance: at least one agent used heuristic fallback; see per-agent provenance above.');
    } else {
      notes.push(\`Neural inference executed via model: \${modelUsed}.\`);
    }`,
'AgentOrchestrator: truthful mixed-source model attribution');

for (const [name, relative] of Object.entries(expectedFiles)) {
  writeFileSync(resolve(relative), edited[name], 'utf8');
}
console.log(`Applied ${changes.length} verified, exact-match corrections on branch ${branch}:`);
for (const item of changes) console.log(`  - ${item}`);
console.log('Next: npm test && npx playwright test && npm run build; review diff before committing.');
