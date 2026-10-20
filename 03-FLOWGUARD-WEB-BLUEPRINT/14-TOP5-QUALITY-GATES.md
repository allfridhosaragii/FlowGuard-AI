# Top-5-Oriented Internal Quality Gates (Not a Guarantee)

## Why these gates exist
The judge's actual ranking cannot be predicted. These are **internal self-audit questions mapped to the official 40/40/20 rubric** to prioritize credible improvements and avoid the common failure of a pretty mock app.

## Scorecard — 100 internal points (never call official judge score)
| Category | Weight | Criteria and proof |
|--|--:|--|
| Product behavior | 15 | Critical user journey works without login; different inputs change behavior; no dead controls |
| UX craft | 10 | Clear hierarchy, visual discipline, responsive/a11y, empty/error states |
| Technical integrity | 10 | Real AI calls, deterministic lab, sensible module separation, no fake telemetry |
| Reliability/security | 5 | Honest failure paths, bounds, no secret leaks or arbitrary execution |
| TestSprite external wiring | 15 | GitHub App connected, actual PR preview, bot check after deployment ready |
| Automated test design | 15 | Useful assertions, edge cases, reject invalid input, failures meaningful |
| Fix and rerun proof | 10 | Real error caught, code corrected, same PR rechecked automatically |
| Product differentiation | 10 | Invariant→counterexample→proof with clearly scoped evidence |
| Demo narrative | 5 | 2-min judge experience, live result explanation, readable report |
| README/compliance | 5 | public source, URLs, account metadata for Discord submission, no misrepresentation |
| TOTAL | **100** | Internal target only |

**Hard fail regardless of total:** no actual TestSprite check on a PR; fake bug/test results; leaked API secret; no live app; core scenario relies entirely on hardcoded preset; cannot reproduce demo; arbitrary untrusted code executed with secrets.

## Trustworthiness rubric
- VERIFIED only with target ID/version + input vector + observed output + timestamp + test runner provenance.
- POTENTIAL findings include PR SHA, file/line source, assumptions and confidence limitations.
- Document false positives during internal QA; don't hide them.
- Never claim model measured accuracy (99.8%, etc.) without benchmark protocol and N.

## Reviewer drill (independent of authoring agent)
1. Judge opens demo on phone in private browser. Can they understand value and reproduce results unassisted?
2. Change lab input to concurrency=1. Does app still output hard-coded "CRITICAL"? If yes fail.
3. Intentionally break API config. Does UI give truthful error rather than stale success?
4. Try non-GitHub PR URL and prompt injection comment. Does guard hold?
5. Show PR check and inspect actual run target URL. Is it the PR preview rather than production?
6. Follow evidence reference to matching code/hash. Can a reviewer reproduce with documented command?
7. Compare README, demo claims and deployed behavior. Is every promise backed by code?

## Recommended evidence links in README
`Live Demo`, `GitHub PR with TestSprite result`, `Tests coverage and run instruction`, `Failure→Fix case`, `Architecture`, `Known limitations`, `Security note`, `Short video` optional. If link not yet available, label TODO; do not substitute placeholder link.
