# North Star, Product Vision, Win Conditions

## One-line promise
**"Find the business rule your code might break. Build the test. Show the evidence."**

## Problem being solved
A developer/AI coding agent can produce a PR that compiles and passes old tests while still violating a business invariant under retry or concurrent requests. FlowGuard helps formulate the invariant and an adversarial test that existing test suites may not include. This is *not* a promise of discovering all real-world vulnerabilities or of replacing SAST/TestSprite.

## User segment & JTBD
Primary: web app maintainer in a TypeScript/Next.js repo with public GitHub PRs, often using AI coding tools. "When I review a transactional change, help me identify a plausible invariant violation and obtain an honest, reproducible test outcome before merge." Secondary: technical judge trying product demo without sign-in.

## P0 release promise: ship only if objectively true
1. Two nontrivial paths: public manual lab + public PR risk analysis.
2. First-party refund fixture is executed in real code and yields inconsistent side effects in vulnerable version, one side effect in fixed version under the same *test vector*.
3. 3 semantic agent stages use real server-side LLM calls and schema validated outputs; no provider configured -> honest `AI_UNAVAILABLE`.
4. PR review never says verified without executing target PR code.
5. Responsive professional UI without misleading text or dead links.
6. TestSprite 3.0 portal test suite + GitHub App attached to repo + actual PR check, ideally red→green with legitimately fixed issue.

## Why potentially competitive (hypotheses, not evidence of Top 5)
- Product narrative fits the competition's main action: code agent builds, PR test fails, agent fixes, check reruns.
- Explicit trust separation (`POTENTIAL` vs `VERIFIED_FAIL`) is useful product differentiation over vague AI findings.
- Self-contained live demonstration with deterministic vulnerable/fixed fixture gives judge something they can actually try.
- Transparent failure/error paths and strong UI craft increase project quality.
- Test suite targets real business behavior, not only navigation, and can be automatic on every PR.

## Rubric plan (NOT predicted judge scores)
| Official area | Points | Internal proof expected |
|--|--:|--|
| Project Quality | 40 | Live end-to-end tasks; responsive accessible design; no fake controls; clear errors; README alignment |
| Tests That Run Themselves | 40 | Required PR test event; actual TestSprite comment/check, meaningful assertions; rerun after commit; ideally merge blocking |
| Innovation | 20 | Invariant-to-counterexample-to-verification pipeline with honest evidence boundary |
| Engagement | Add-on | Public technical write-up, project progress or demo share only after product works; no engagement spam |

## Primary success metrics
- **0** unsupported `VERIFIED_*` decisions, 0 exposed secrets, 0 fake statistics.
- All P0 acceptance IDs get runnable test IDs; tests produce actual results.
- 1 reproducible genuine test FAIL+PASS pair, aligned input and fixture versions.
- 1 PR with an *actual* TestSprite check; no screenshot of an invented check.
- 1 public demo a judge can experience without an account in ≤2 min.

## Scope discipline
Not launching a universal AI SAST, untrusted repo sandbox, self-repairing system, distributed transaction proof, real payment/refund gateway, fake zero-day detection or auto-changing arbitrary code. Document all of these as **future opportunities only**.

Official sources: https://www.testsprite.com/hackathon-s4 and https://docs.testsprite.com/web-portal/integrations/github-integration
