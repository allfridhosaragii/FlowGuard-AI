import { AIProvider } from '../ai/provider';
import { BusinessInvariant, BusinessInvariantSchema } from '../schemas/agent-schemas';

export class RequirementAgent {
  public static async analyze(
    humanRule: string,
    prContext?: { title: string; description: string; files: string[] }
  ): Promise<{ invariants: BusinessInvariant[]; isRealModel: boolean; modelName: string }> {
    const isConfigured = AIProvider.isConfigured();

    if (isConfigured) {
      const systemPrompt = `You are Agent A (Requirement Analyst) for FlowGuard AI.
Your job is to convert natural language business rules into formal, machine-readable invariants and acceptance criteria.
You MUST output valid JSON matching this schema:
{
  "invariants": [
    {
      "id": "INV-001",
      "humanText": "Natural language rule description",
      "predicate": "Formal predicate (e.g. count(refunds_for(key)) <= 1)",
      "scope": "Target domain or module",
      "assumptions": ["Assumption 1", "Assumption 2"]
    }
  ]
}
Do NOT invent unrelated rules. Do NOT mark any test as passed.`;

      const userPrompt = `Human Business Rule:
"${humanRule}"

Pull Request Context:
Title: ${prContext?.title || 'N/A'}
Description: ${prContext?.description || 'N/A'}
Changed Files: ${prContext?.files?.join(', ') || 'N/A'}`;

      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content);
        const invariants = (parsed.invariants || []).map((inv: any, idx: number) =>
          BusinessInvariantSchema.parse({
            id: inv.id || `INV-${String(idx + 1).padStart(3, '0')}`,
            humanText: inv.humanText || humanRule,
            predicate: inv.predicate || 'state_transition_valid',
            scope: inv.scope || 'Payment / Transaction Flow',
            assumptions: Array.isArray(inv.assumptions) ? inv.assumptions : [],
          })
        );
        return {
          invariants: invariants.length > 0 ? invariants : [this.fallbackInvariant(humanRule)],
          isRealModel: true,
          modelName: response.modelName,
        };
      } catch (err) {
        // Fallback if model output failed schema
        return {
          invariants: [this.fallbackInvariant(humanRule)],
          isRealModel: true,
          modelName: response.modelName,
        };
      }
    }

    // Explicit Rule-based Offline Parser
    return {
      invariants: [this.fallbackInvariant(humanRule)],
      isRealModel: false,
      modelName: 'heuristic-rule-engine-v1',
    };
  }

  private static fallbackInvariant(humanRule: string): BusinessInvariant {
    const isIdempotency = /idempot|repeat|concurren|refund|double|settle|duplicate/i.test(humanRule);
    const isAuth = /auth|token|jwt|permit|role|unauthor/i.test(humanRule);

    if (isIdempotency) {
      return {
        id: 'INV-REFUND-001',
        humanText: humanRule,
        predicate: 'count(settled_side_effects(idempotencyKey)) <= 1',
        scope: 'Payment & Settlement Processing',
        assumptions: [
          'Clients may retry failed or timed-out network requests with identical idempotency key.',
          'Database operations may experience concurrent thread scheduling.',
        ],
      };
    }

    if (isAuth) {
      return {
        id: 'INV-AUTH-001',
        humanText: humanRule,
        predicate: 'valid_signature(token) == true && user_has_permission(role, resource)',
        scope: 'Authentication & API Gateway',
        assumptions: [
          'Tokens must contain cryptographically signed signatures.',
          'Privileged endpoints require explicit authorization checks.',
        ],
      };
    }

    return {
      id: 'INV-GEN-001',
      humanText: humanRule,
      predicate: 'satisfies_business_invariant(input, system_state)',
      scope: 'Application Core',
      assumptions: ['Input parameters must be bounded and validated against domain invariants.'],
    };
  }
}
