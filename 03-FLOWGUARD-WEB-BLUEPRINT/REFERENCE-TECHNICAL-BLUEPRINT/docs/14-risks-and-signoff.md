# 14 — Risks, Decision Log, Completeness and Sign-off

## Risk register

| Risk | Severity | Likelihood | Owner | Mitigation | Gate |
|---|---|---|---|---|---|
| AI makes up a vulnerability | Critical | High | AI engineer | Verified verdict only from runner; source validation | G2 |
| Controlled fixture mistaken for arbitrary PR proof | Critical | High | Product owner | Different labels/target IDs and honest disclaimer | G1/G2 |
| Excessive scope near deadline | Critical | High | Project lead | P0 narrow refund invariant, cut P1/P2 | Daily |
| TestSprite trigger never fires | Critical | Medium | Release | Create PR preview early, Detect Events, Send Test Event | G3 |
| Fake telemetry/metrics undermine trust | High | High | UI owner | Remove all unmeasured stats and 'live' logs | G1 |
| Unauthorized arbitrary code execution | Critical | Medium | Security | No remote code runner, fixture allowlist only | G1 |
| LLM/provider inaccessible or slow | High | Medium | Backend | Fail loudly, per-stage timeouts, lab independent | G2 |
| Secrets leaked to browser/logs | Critical | Medium | Security | Server-only env, scans, review | G3 |
| PR diff too long or injection-laden | High | Medium | Backend | Bounds, sanitization, prompts treat code as data | G2 |
| Neon unavailable/setup takes too long | Medium | Medium | Backend | Lab stateless and P1 persistence deferred | G1 |
| User misunderstands non-verified finding | High | Medium | UX | Status copy, color+text, evidence provenance | G2 |
| Vercel preview protection blocks TestSprite | High | Medium | Integration | Validate public preview or supported test credentials | G3 |
| Perceived similarity to existing reviewer | High | High | Product lead | Business invariant + actual execution proof niche | Demo |

## Formal decision log

- D-01: Focus on refund idempotency, not broad security scanning — **Frozen P0**.
- D-02: Three sequential reasoned agent stages with strict schemas — **Frozen P0**.
- D-03: First-party deterministic lab is only environment eligible for executed verification — **Frozen P0**.
- D-04: Public PR review read-only; source-specific risk hypothesis, not automatic execution — **Frozen P0**.
- D-05: No auth for demo; public, synthetic inputs only — **Frozen P0**.
- D-06: Neon optional to unlock saved history; do not block core lab — **Frozen fallback**.
- D-07: TestSprite is independent QA for FlowGuard, not our inference engine — **Frozen P0**.
- D-08: Existing Vercel URL/repo retained, build on feature branch — **Frozen P0**.
- D-09: No commercial or quantitative claims without instrumented evidence — **Frozen policy**.
- D-10: Post-deadline roadmap is not described as shipped — **Frozen policy**.

## What '100%' can mean responsibly

A number assigned by an AI without inspection does not prove perfection. We define **specification completion** as a check of *design coverage*, not reliability:

| Domain | Written artifact | Decision closed? | How real quality is proved |
|---|---|---|---|
| Problem/market | 01 | Yes, bounded target | User studies/competitor benchmark later |
| Requirements and scope | 02 | Yes | FR->test traceability |
| User journey/UIUX | 03 | Yes | Real device/E2E/a11y checks |
| Architecture | 04 | Yes | Build/integration proof |
| Agent design | 05 | Yes | Real model invocation + schema tests |
| Verification engine | 06 | Yes | Vulnerable/fixed vector tests |
| External GitHub/TestSprite | 07 | Yes | Real PR bot check |
| QA | 08 | Yes | Executed test reports |
| Security and privacy | 09 | Yes | Threat tests and manual audit |
| Operations/cost | 10 | Yes, budgets specified | Actual token/spend/latency monitoring |
| Schedule/feasibility | 11 | Yes, with cuts | Daily observed progress |
| Demo/submission | 12 | Yes | Actual live links/Discord post |
| Coding instructions | 13 | Yes | Source/CI changes |
| Risk/decisions | 14 | Yes | Risk closure reviews |
| Current-state baseline | 15 | Yes as of inspection | New GitHub audit after build |
| Honest terminology | 16 | Yes | Copy audit |
| API/schema contracts | specs/ | Yes | Contract integration tests |
| Market validation/long-term plan | 17 | Yes, methods set, data not yet collected | Pilot research after event |

This is **100% documented decision areas with explicit acceptance gates**, assuming the included files pass consistency validation. It is **not** 100% proven implementation, zero technical risk, validated market fit, or guaranteed hackathon result. No further clarifying questions are required to start P0 build.

## Sign-off questionnaire (evidence required)

- Is there any `VERIFIED_*` finding without a run ID and observed effects? If yes, BLOCK.
- Do all three agents really invoke configured provider and validate JSON? If no, mark missing capability openly.
- Are fixture outcomes computed by running code rather than preset HTML strings? If no, BLOCK.
- Is the live URL demonstrably up and are TestSprite checks visible on a real PR? If no, NOT submission-ready.
- Does README match shipped app? If no, FIX.
- Does user need to enter secrets or log in for demo? If yes, simplify.
- Are actual tokens/costs and latencies measured rather than asserted? If no, remove numbers.

## Primary sources

- https://www.testsprite.com/hackathon-s4
- https://docs.testsprite.com/web-portal/integrations/github-integration
- https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
