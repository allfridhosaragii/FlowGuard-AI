# Research Synthesis & Competitive Positioning

## Observed developer pain
- AI-written changes are fast but not guaranteed to meet unspecified business rules. Existing unit tests may not include retry/concurrency cases. For developer survey context, consult https://survey.stackoverflow.co/2025/; do not translate one question's response rate into "% of all developers".
- Static lint can detect patterns, but cannot generally prove multi-request business behavior.
- AI review comments may be hypotheses, not necessarily findings backed by runtime evidence.
- Tests may pass due to weak assertions or missing scenarios. FlowGuard proposes invariant-focused test vectors.

## Products to benchmark, not dismiss
| Category | Examples | Overlap risk | Intentional narrow differentiation |
|--|--|--|--|
| AI code review | Qodo, CodeRabbit, Greptile | High | Business invariant backed by executable *bounded* scenario and explicit proof scope |
| App test generation | TestSprite, Playwright agents | High | Requirement-to-risk reasoning; rely on TestSprite for product QA, not falsely claim formal TestSprite API integration |
| Static SAST | Semgrep, CodeQL | Medium | Retry/idempotency business semantics, not generic static security checks |
| Error monitoring | Sentry | Medium | Pre-merge synthetic reproduction, not runtime production alerting |
| General coding agents | Claude Code, Codex, Antigravity | High | Review and verify output independent of agent that authored it |

## Evidence grade policy
- **Grade A:** official rules/specs and reproducible instrumented tests with commit SHA and commands.
- **Grade B:** independent public benchmark with harness/config/results, verified code examples.
- **Grade C:** developer social anecdotes, Reddit/X/Discord comments (useful for hypotheses, not population evidence).
- **Grade D:** marketing claims or unreplicable winner stories; never use as proof of model superiority.

## What makes FlowGuard different, if implemented
1. User writes explicit invariant (human decides what matters).
2. Agent extracts testable acceptance criteria and links to source context.
3. Risk Hunter proposes *why a code change might violate it*.
4. Planner suggests bounded checks, not arbitrary shell commands.
5. Deterministic first-party lab demonstrates one known failure mode with real observations.
6. Evidence explicitly states **what code was actually executed** and what was merely inferred.

## Innovation limitations to disclose
- Executing the bundled vulnerable fixture does **not** verify a random third-party PR, even if its code resembles the example.
- Models can hallucinate file references, severity and root causes. Validate GitHub diff line references; no unsupported `VERIFIED`.
- A competitor may already support related functionality. Judge merit depends on completeness and implementation, not claim of being first.

## A genuine user validation protocol (after first working build)
Have 3 developers independently: (a) describe a real invariant, (b) input a sample public PR, (c) interpret the `POTENTIAL` / `VERIFIED` states, (d) reproduce lab results. Record task completion, confusion, time-to-understanding and bugs without inventing participant counts/results. Add evidence to README only after actually collecting it.

## Official/web evidence to re-check before submission
- https://www.testsprite.com/hackathon-s4
- https://docs.testsprite.com/web-portal/integrations/github-integration
- https://www.testsprite.com/use-cases/en/how-to-test-vercel-preview-deployments
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/rest/pulls/pulls
