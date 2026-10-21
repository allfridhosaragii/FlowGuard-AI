import { AIProvider } from '../ai/provider';
import { BusinessInvariant, BusinessInvariantSchema } from '../schemas/agent-schemas';

export type DomainType = 'auth' | 'payment' | 'arithmetic' | 'health' | 'general';

export function detectDomain(text: string): DomainType {
  if (!text) return 'general';
  const lower = text.toLowerCase();
  const isAuth = /\b(jwt|token|bearer|alg|signature|auth|privileged|permission|claim|unauthorized|credential)\b/i.test(lower);
  const isPayment = /\b(refund|idempot|payment|settle|balance|deduct|charge|withdraw|transaction|duplicate)\b/i.test(lower);
  const isArithmetic = /\b(add|sum|sub|mult|multiply|divide|math|calc|fib|arithmetic|pure|integer|modulo|factorial|even|odd|abs|power|square|sqrt|prime)\b/i.test(lower);
  const isHealth = /\b(uptime|health|ping|status|healthcheck|metrics)\b/i.test(lower);

  // If text is purely arithmetic and contains no auth or payment concepts
  if (isArithmetic && !isAuth && !isPayment) return 'arithmetic';
  if (isAuth && !isPayment) return 'auth';
  if (isPayment) return 'payment';
  if (isHealth) return 'health';
  return 'general';
}

export class RequirementAgent {
  public static async analyze(
    humanRule: string,
    prContext?: { title: string; description: string; files: string[] },
    codeDiff?: string
  ): Promise<{
    invariants: BusinessInvariant[];
    isRealModel: boolean;
    modelName: string;
    domainMismatch?: boolean;
    mismatchNotice?: string;
  }> {
    const ruleDomain = detectDomain(humanRule);
    const codeDomain = codeDiff ? detectDomain(codeDiff) : 'general';

    // Domain compatibility check
    let domainMismatch = false;
    let mismatchNotice: string | undefined = undefined;

    if (codeDiff && codeDomain !== 'general' && ruleDomain !== 'general' && codeDomain !== ruleDomain) {
      domainMismatch = true;
      mismatchNotice = `Domain Notice: Specified business rule references ${ruleDomain.toUpperCase()} domain, but the provided code snippet belongs to ${codeDomain.toUpperCase()} domain. FlowGuard evaluated ${codeDomain.toUpperCase()} safety invariants for the target code.`;
    }

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
CRITICAL RULES:
1. Do NOT invent unrelated rules or authentication requirements for arithmetic/math code.
2. Align invariant scope strictly with the domain of the target code.
3. Do NOT mark any test as passed.`;

      const userPrompt = `Human Business Rule:
"${humanRule}"

Target Code Context:
${codeDiff ? codeDiff.slice(0, 5000) : 'N/A'}

Pull Request Context:
Title: ${prContext?.title || 'N/A'}
Description: ${prContext?.description || 'N/A'}
Changed Files: ${prContext?.files?.join(', ') || 'N/A'}`;

      const response = await AIProvider.generateJSON(systemPrompt, userPrompt);
      try {
        const parsed = JSON.parse(response.content) as { invariants?: Record<string, unknown>[] };
        const filtered = (parsed.invariants || []).filter((inv) => {
          if (codeDomain === 'arithmetic') {
            const txt = `${inv.id || ''} ${inv.scope || ''} ${inv.predicate || ''}`.toLowerCase();
            return !txt.includes('auth') && !txt.includes('jwt') && !txt.includes('refund') && !txt.includes('payment');
          }
          return true;
        });

        const invariants = filtered.map((inv, idx: number) =>
          BusinessInvariantSchema.parse({
            id: inv.id || `INV-${String(idx + 1).padStart(3, '0')}`,
            humanText: inv.humanText || humanRule,
            predicate: inv.predicate || 'state_transition_valid',
            scope: inv.scope || (codeDomain === 'arithmetic' ? 'Arithmetic & Core Logic' : 'Application Core'),
            assumptions: Array.isArray(inv.assumptions) ? inv.assumptions : [],
          })
        );
        return {
          invariants: invariants.length > 0 ? invariants : [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: invariants.length > 0,
          modelName: invariants.length > 0
            ? response.modelName
            : 'heuristic-rule-engine-v1 (model returned no usable invariants)',
          domainMismatch,
          mismatchNotice,
        };
      } catch (err) {
        return {
          invariants: [this.fallbackInvariant(humanRule, codeDiff)],
          isRealModel: false,
          modelName: 'heuristic-rule-engine-v1 (invalid model output)',
          domainMismatch,
          mismatchNotice,
        };
      }
    }

    // Explicit Rule-based Offline Parser
    return {
      invariants: [this.fallbackInvariant(humanRule, codeDiff)],
      isRealModel: false,
      modelName: 'heuristic-rule-engine-v1',
      domainMismatch,
      mismatchNotice,
    };
  }

  public static fallbackInvariant(humanRule: string, codeDiff?: string): BusinessInvariant {
    const ruleDomain = detectDomain(humanRule);
    const codeDomain = codeDiff ? detectDomain(codeDiff) : 'general';

    // 1. If codeDiff is present, codeDomain takes precedence over incompatible rule domains:
    if (codeDiff) {
      if (codeDomain === 'arithmetic') {
        return {
          id: 'INV-MATH-001',
          humanText: humanRule,
          predicate: 'pure_function(input) == true && preserves_arithmetic_invariants()',
          scope: 'Arithmetic & Core Computational Logic',
          assumptions: [
            'Function must be pure and free of external mutations or uncommitted side effects.',
            'Arithmetic operations must satisfy mathematical associativity and range limits.',
          ],
        };
      }

      if (codeDomain === 'health') {
        return {
          id: 'INV-HEALTH-001',
          humanText: humanRule,
          predicate: 'status_reported == true && state_mutations_count == 0',
          scope: 'Telemetry & Process Health',
          assumptions: [
            'Health check responses must be read-only and return current service uptime.',
          ],
        };
      }

      if (codeDomain === 'auth') {
        return {
          id: 'INV-AUTH-001',
          humanText: humanRule,
          predicate: 'jwt.verify(token, secret, { algorithms: ["HS256"] }) == true && !token.isExpired()',
          scope: 'Authentication & API Gateway',
          assumptions: [
            'Token signature must match trusted cryptographic secret/key.',
            'Expired tokens or tokens with alg="none" must be rejected immediately.',
          ],
        };
      }

      if (codeDomain === 'payment') {
        return {
          id: 'INV-REFUND-001',
          humanText: humanRule,
          predicate: 'count(settled_side_effects(idempotencyKey)) <= 1',
          scope: 'Payment & Settlement Processing',
          assumptions: [
            'Clients may retry failed or timed-out network requests with identical idempotency key.',
            'Database operations may experience concurrent asynchronous request interleaving.',
          ],
        };
      }
    }

    // 2. If codeDiff is not provided (or general), fall back to rule domain:
    if (ruleDomain === 'arithmetic') {
      return {
        id: 'INV-MATH-001',
        humanText: humanRule,
        predicate: 'pure_function(input) == true && preserves_arithmetic_invariants()',
        scope: 'Arithmetic & Core Computational Logic',
        assumptions: [
          'Function must be pure and free of external mutations or uncommitted side effects.',
        ],
      };
    }

    if (ruleDomain === 'payment') {
      return {
        id: 'INV-REFUND-001',
        humanText: humanRule,
        predicate: 'count(settled_side_effects(idempotencyKey)) <= 1',
        scope: 'Payment & Settlement Processing',
        assumptions: [
          'Clients may retry failed or timed-out network requests with identical idempotency key.',
          'Database operations may experience concurrent asynchronous request interleaving.',
        ],
      };
    }

    if (ruleDomain === 'auth') {
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

    if (ruleDomain === 'health') {
      return {
        id: 'INV-HEALTH-001',
        humanText: humanRule,
        predicate: 'status_reported == true && state_mutations_count == 0',
        scope: 'Telemetry & Process Health',
        assumptions: [
          'Health check responses must be read-only and return current service uptime.',
        ],
      };
    }

    // 3. Default generic invariant:
    return {
      id: 'INV-GEN-001',
      humanText: humanRule,
      predicate: 'satisfies_business_invariant(input, system_state)',
      scope: 'Application Core',
      assumptions: ['Input parameters must be bounded and validated against domain invariants.'],
    };
  }
}
