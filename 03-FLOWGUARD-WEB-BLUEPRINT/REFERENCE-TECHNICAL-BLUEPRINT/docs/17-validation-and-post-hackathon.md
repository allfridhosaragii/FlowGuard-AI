# 17 — Market Validation, Differentiation Benchmark, Roadmap, Licensing

## Problem validation before claiming market fit

'Everyone needs this' is not a verified market statement. The smallest testable target is a team shipping transactional TypeScript applications and already using PR reviews and automated tests. Measure pain from specific incidents (duplicate settlement, race condition, retry handling, missing invariant coverage), not generic interest in AI.

### 5-person interview script

1. 'Tell me about the last regression that passed code review/tests and reached staging or production.'
2. 'How did you discover it, reproduce it, and decide it was fixed?'
3. 'Which steps were most expensive and what did you use (tests, CodeRabbit, Qodo, GitHub Actions, TestSprite, manual logs)?'
4. 'How often does a change violate a business rule even when unit tests pass?'
5. 'Would you paste an invariant next to a PR URL? Would you trust any tool to execute your PR code? Under what controls?'

Do not solicit or retain confidential code. Record anonymized themes and whether the user actually reuses the product on a second PR, not just a favorable opinion.

## Competitive evidence benchmark

Compare with CodeRabbit, Qodo, Greptile, GitHub Copilot review, TestSprite and traditional unit/E2E tooling. Use a consistent matrix for **a fixed set of 10 public PR cases**: whether tool extracts a business rule, cites precise source, proposes a test, actually executes the test, binds result to target SHA and states unknown when not verified. Do not claim differentiation before collecting actual head-to-head results. Obtain tool access/permissions and observe published terms if doing future comparisons.

## Pilot scorecard after event (measurable, not preset results)

- **Activation:** percentage of willing pilot users completing one report with no assistance.
- **Repeat usage:** percent of activated users analyzing a second PR in 14 days.
- **Actionable feedback:** fraction of risk findings developers confirm useful after inspection.
- **Valid proof:** verified verdicts with run IDs / all verified verdicts, target 100%.
- **False-positive tracking:** count of agent hypotheses disproved by code/tests, annotated by human reviewer.
- **Cost per analysis:** actual input/output token usage times provider pricing, plus hosting (report distribution; don't invent dollars).
- **Time to first useful result:** median from page opening to an actionable hypothesis or test evidence.

## Roadmap (post-hackathon, contingent on validation)

- **0–2 weeks:** migrate controlled lab to genuine test harness invoked from an owner-approved CI workflow on the user's repository, tied to exact PR SHA; protect credentials from untrusted branches.
- **2–6 weeks:** own GitHub App, repository permissions/installation management, read-only checks, team invariants registry, regression trends.
- **6–12 weeks:** ephemeral sandbox for untrusted code with isolation and quotas; additional state machine/authorization templates; reproducible cross-language runtime checks.
- **3+ months:** enterprise authentication/RBAC, audit logs, policy-as-code, paid usage plans if interviews justify real retention/payment.

## Business model hypothesis

P0 is free/no-login demonstration with request caps. Future paid model could charge by verified PR executions rather than AI chat tokens, with a small free quota; **no pricing chosen until costs/adoption observed**. Avoid adding billing during hackathon.

## License / compliance decision

Current README shows a MIT badge and `package.json` says MIT, but repository listing at audit did not contain a `LICENSE` file. Include a real MIT license text before publicly claiming license compliance. Do not copy proprietary code or training data from private repos into public demos. If using model-provider APIs, follow current provider terms and disclose source data transfer.

## Definition of competitive innovation

The novelty claim for FlowGuard is not the existence of three LLM calls. It is the **explicit boundary between hypotheses and target-bound runtime proof**, with business invariants and a reproducible test contract. Judge this claim by real demo and test evidence; acknowledge commercial competitors may already cover parts of this workflow.
