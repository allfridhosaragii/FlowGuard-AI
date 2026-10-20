# 10 — Operational Reliability, Monitoring, Cost and Performance Budgets

## Environment variables (names only)

```env
# Server only; never commit real values
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=
GITHUB_READ_TOKEN=
DATABASE_URL=
ANALYZE_ENABLED=true
PR_ANALYSIS_ALLOWLIST=allfridhosaragii/FlowGuard-AI
MAX_ANALYSES_PER_IP_PER_DAY=5
MAX_LAB_RUNS_PER_IP_PER_DAY=30
```

**Credential scope**: provider URL fixed by deploy-time configuration, no user-provided endpoint; GitHub token read-only and optional for public PR. If no DB env, lab may run stateless; PR history persistence must be disabled with a clear UI message.

## Budgets and constraints

- One analysis <= 3 model calls, each response <= 2,000 tokens, total <= 18,000 input tokens and <= 6,000 output tokens (engineering caps, **not observed usage**).
- Initial quota: <= 5 PR analyses/IP/day, <= 30 lab runs/IP/day; add global daily provider spend cap and request concurrency <= 3.
- PR diff cap: 20 files, <= 100KB text and <= 3,000 changed lines. If exceeded, `UNSUPPORTED_SCOPE`, do not silently drop crucial context.
- At 3 calls and a total budget of 18k input+6k output tokens, **100 maximum-size analyses** would use up to 1.8M input and 0.6M output tokens. Cost formula: `1.8 * (model $/1M input tokens) + 0.6 * (model $/1M output tokens)`, plus hosting/DB. This is a ceiling example, not a live price quote. Verify provider prices before enabling paid API.
- Lab tests require no LLM calls; valid report should remain reproducible when AI is down.

## Latency goals (targets, not existing measurements)

| Operation | Target | Failure behavior |
|---|---|---|
| App homepage | usable without blocking AI | Show local error only if route unavailable |
| Fixture lab N<=5, iterations<=20 | p95 < 2 seconds under test | `INCONCLUSIVE` or `ERROR`, not PASS |
| PR metadata fetch | < 8 seconds timeout | `GITHUB_UNAVAILABLE`/`RATE_LIMITED` |
| Each agent stage | 10 second timeout | `MODEL_TIMEOUT` |
| Overall PR analysis | <= 45 seconds target, subject to configured hosting limits | Preserve input, user retry |
| TestSprite suite | complete after ready preview, based on provider actual run | Do not fabricate run time or completion |

## Resilience and graceful degradation

- Network errors: exponential backoff limited to one retry for 429/5xx if remaining time budget allows; obey `Retry-After` if practical.
- Invalid AI JSON: one corrective retry then `SCHEMA_INVALID`; no use of half-formed result to claim success.
- Missing provider key: PR analysis says `AI_NOT_CONFIGURED`, lab still works without AI. Never market it as functioning multi-agent in this state.
- Missing DB: no persisted history; ephemeral results (or return explicit storage error) and no promise of repeatable share URLs.
- GitHub rate limits: show next action/when to retry, no assertion that URL is invalid if a 429 occurred.
- TestSprite credits: run focused suite often after substantive changes, no disabling tests solely to save credits; organizer boost request form if needed.

## Monitoring and logging

Store only safe metadata: request ID, route, status code, elapsed ms, model stage, token count if provided, retry count, masked remote host, lab fixture ID, verdict, test suite revision. Never log raw PR code/secret/business rule by default. Add health endpoint that only reports app version and readiness of optional subsystems, not API key values.

## Dependency hygiene

Pin Node LTS and lockfile, `npm ci` in CI, strict TypeScript, audit high-risk dependencies, avoid unbounded imports/AI packages. Use Sentry/error-tracking only after securing privacy and adding real error handling; not required P0.

## SLOs and claimed metrics

Before launch: **no claimed accuracy/catch rate, availability, latency, or zero-day detection**. Collect actual runtime measurements and keep them labeled as sample size, date and environment. 100% deterministic lab invariant success target on published fixture suite; verify with real CI logs before stating achievement.
