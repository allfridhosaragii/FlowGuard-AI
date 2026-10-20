import { AnalysisResult, StageTrace } from '../schemas/agent-schemas';
import { RequirementAgent } from './requirement-agent';
import { RiskHunterAgent } from './risk-agent';
import { VerificationPlannerAgent } from './verification-agent';
import { PRCoverageMetadata } from '../github/pr-reader';

export interface AnalysisInput {
  businessRule: string;
  sourceType: 'GITHUB_PR' | 'MANUAL_CODE';
  sourceReference: string;
  sourceSha?: string;
  codeDiff?: string;
  filePaths?: string[];
  prCoverage?: PRCoverageMetadata;
  prContext?: {
    title: string;
    description: string;
    files: string[];
    coverage?: PRCoverageMetadata;
  };
}

export class AgentOrchestrator {
  public static async run(input: AnalysisInput): Promise<AnalysisResult> {
    const runId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const startTime = Date.now();
    const stages: StageTrace[] = [];
    const notes: string[] = [];

    // Stage 1: VALIDATING_INPUT
    const stage1Start = Date.now();
    if (!input.businessRule || input.businessRule.trim().length < 10) {
      throw new Error('Business rule must be at least 10 characters long');
    }
    if (input.businessRule.length > 2000) {
      throw new Error('Business rule exceeds maximum length of 2,000 characters');
    }
    stages.push({
      stage: 'VALIDATING_INPUT',
      status: 'SUCCESS',
      durationMs: Date.now() - stage1Start,
      agentName: 'System Gatekeeper',
      summary: `Validated input constraints (${input.businessRule.length} chars).`,
    });

    // Stage 2: FETCHING_CONTEXT
    const stage2Start = Date.now();
    const files = input.filePaths || input.prContext?.files || ['src/service.ts'];
    const diff = input.codeDiff || '';
    stages.push({
      stage: 'FETCHING_CONTEXT',
      status: 'SUCCESS',
      durationMs: Date.now() - stage2Start,
      agentName: 'GitHub Context Loader',
      summary: `Loaded ${files.length} changed files (${diff.length} bytes diff).`,
    });

    // Stage 3: EXTRACTING_RULE (Agent A)
    const stage3Start = Date.now();
    const reqResult = await RequirementAgent.analyze(input.businessRule, input.prContext);
    stages.push({
      stage: 'EXTRACTING_RULE',
      status: 'SUCCESS',
      durationMs: Date.now() - stage3Start,
      agentName: 'Agent A (Requirement Analyst)',
      summary: `Extracted ${reqResult.invariants.length} machine-verifiable invariant(s).`,
    });

    // Stage 4: RISK_ANALYSIS (Agent B)
    const stage4Start = Date.now();
    const riskResult = await RiskHunterAgent.analyze(reqResult.invariants, diff, files);
    stages.push({
      stage: 'RISK_ANALYSIS',
      status: 'SUCCESS',
      durationMs: Date.now() - stage4Start,
      agentName: 'Agent B (Risk Hunter)',
      summary: `Identified ${riskResult.findings.length} candidate risk finding(s).`,
    });

    // Stage 5: PLANNING_CHECK (Agent C)
    const stage5Start = Date.now();
    const planResult = await VerificationPlannerAgent.plan(
      reqResult.invariants,
      riskResult.findings
    );
    stages.push({
      stage: 'PLANNING_CHECK',
      status: 'SUCCESS',
      durationMs: Date.now() - stage5Start,
      agentName: 'Agent C (Verification Planner)',
      summary: `Synthesized ${planResult.plans.length} verification plan(s).`,
    });

    // Stage 6: COMPLETED
    stages.push({
      stage: 'COMPLETED',
      status: 'SUCCESS',
      durationMs: Date.now() - startTime,
      agentName: 'Orchestrator Pipeline',
      summary: 'Pipeline execution finished cleanly.',
    });

    const isRealModel = reqResult.isRealModel || riskResult.isRealModel;
    const modelUsed = reqResult.modelName;

    if (!isRealModel) {
      notes.push(
        'Server-side LLM_API_KEY is not configured in this environment. Analysis was performed using deterministic heuristic rule checking. Results are labeled as heuristic.'
      );
    } else {
      notes.push(`Neural inference executed via model: ${modelUsed}.`);
    }

    // Partial analysis coverage note
    if (input.prCoverage?.isPartialAnalysis) {
      const c = input.prCoverage;
      notes.push(
        `Partial Analysis: This PR contains ${c.totalFiles} changed files. ` +
        `FlowGuard analysed the ${c.analyzedFiles} most relevant source files and skipped ${c.skippedFiles} ` +
        `non-code or lower-priority files. ` +
        `Selection strategy: ${c.selectionStrategy}.`
      );
    }

    notes.push(
      'Evidence Scope: All findings for external PRs are classified as POTENTIAL until target code is executed in an isolated verification sandbox.'
    );

    const verdict = riskResult.findings.length > 0 ? 'POTENTIAL' : 'NO_RISK_FOUND';

    return {
      runId,
      sourceType: input.sourceType,
      sourceReference: input.sourceReference,
      sourceSha: input.sourceSha || 'git:latest',
      businessRule: input.businessRule,
      invariants: reqResult.invariants,
      findings: riskResult.findings,
      plans: planResult.plans,
      stages,
      modelUsed,
      isRealModel,
      verdict,
      executedAtUtc: new Date().toISOString(),
      notes,
    };
  }
}
