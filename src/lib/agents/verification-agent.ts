import { AIProvider } from '../ai/provider';
import {
  BusinessInvariant,
  RiskFinding,
  VerificationPlan,
  VerificationPlanSchema,
} from '../schemas/agent-schemas';

export class VerificationPlannerAgent {
  public static async plan(
    invariants: BusinessInvariant[],
    findings: RiskFinding[]
  ): Promise<{ plans: VerificationPlan[]; isRealModel: boolean; modelName: string }> {
    const isConfigured = AIProvider.isConfigured();

    if (findings.length === 0) {
      return {
        plans: [],
        isRealModel: isConfigured,
        modelName: isConfigured ? AIProvider.getModelName() : 'heuristic-rule-engine-v1',
      };
    }

    if (isConfigured) {
      const systemPrompt = `You are Agent C (Verification Planner) for FlowGuard AI.
Convert identified risk findings into structured, reproducible test specifications.
CRITICAL RULES:
1. Do NOT claim the test has executed.
2. Specify exact input vectors, expected vs failure conditions.
3. Test types allowed: 'IDEMPOTENCY_CONCURRENCY', 'BOUNDARY_CHECK', 'AUTH_STATE', 'UNSUPPORTED'.
4. Output valid JSON matching:
{
  "plans": [
    {
      "findingId": "RISK-001",
      "testType": "IDEMPOTENCY_CONCURRENCY",
      "fixtureId": "refund-vulnerable-v1",
      "inputVector": {
        "concurrency": 2,
        "paymentId": "pay_test_001",
        "idempotencyKey": "retry_token_99",
        "amountMinor": 125000
      },
      "expectedEffects": "Exactly 1 side effect committed; duplicate requests ignored.",
      "supportState": "SUPPORTED"
    }
  ]
}`;

      const userPrompt = `Invariants:
${JSON.stringify(invariants, null, 2)}

Findings:
${JSON.stringify(findings, null, 2)}`;

      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content) as { plans?: Record<string, unknown>[] };
        const plans = (parsed.plans || []).map((p, idx: number) =>
          VerificationPlanSchema.parse({
            findingId: p.findingId || findings[idx]?.id || 'RISK-001',
            testType: p.testType || 'IDEMPOTENCY_CONCURRENCY',
            fixtureId: p.fixtureId || 'refund-vulnerable-v1',
            inputVector: p.inputVector || {
              concurrency: 2,
              paymentId: 'pay_demo_001',
              idempotencyKey: 'retry-test-key',
              amountMinor: 125000,
            },
            expectedEffects: p.expectedEffects || 'Maximum 1 committed side effect.',
            supportState: p.supportState || 'SUPPORTED',
          })
        );
        return {
          plans,
          isRealModel: true,
          modelName: response.modelName,
        };
      } catch (err) {
        return {
          plans: this.heuristicPlan(findings),
          isRealModel: true,
          modelName: response.modelName,
        };
      }
    }

    // Explicit Offline Heuristic Planner
    return {
      plans: this.heuristicPlan(findings),
      isRealModel: false,
      modelName: 'heuristic-rule-engine-v1',
    };
  }

  private static heuristicPlan(findings: RiskFinding[]): VerificationPlan[] {
    return findings.map((f) => {
      const isIdempotency = /race|idempot|concurren|refund|double/i.test(f.why);

      if (isIdempotency) {
        return {
          findingId: f.id,
          testType: 'IDEMPOTENCY_CONCURRENCY',
          fixtureId: 'refund-vulnerable-v1',
          inputVector: {
            concurrency: 2,
            paymentId: 'pay_demo_001',
            idempotencyKey: 'retry_sample_key',
            amountMinor: 125000,
          },
          expectedEffects:
            'Exactly 1 refund side-effect committed to ledger; second concurrent request rejected or ignored.',
          supportState: 'SUPPORTED',
        };
      }

      return {
        findingId: f.id,
        testType: 'BOUNDARY_CHECK',
        fixtureId: undefined,
        inputVector: {
          testScenario: 'boundary_and_fuzzing',
          simulatedPayload: 'malformed_input',
        },
        expectedEffects: 'System safely rejects invalid state transitions without corrupting ledger.',
        supportState: 'UNSUPPORTED',
      };
    });
  }
}
