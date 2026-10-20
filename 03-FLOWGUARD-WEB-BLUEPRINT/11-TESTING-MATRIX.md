# Quality Engineering — Test Matrix, Priorities, Negative Controls

## Test pyramid
- **Unit (Vitest):** pure refund state machine, schema validation, trust policy, PR URL parser, verdict enum, agent normalization; cheap and deterministic.
- **Integration (Vitest + mocked upstream):** API lab result, GitHub fetching, AI response, timeout, rate limit, error mapping, evidence metadata.
- **E2E (Playwright):** judge flow `/`→`/lab` vulnerable/fixed, PR form/error, responsive/keyboard. No production credentials.
- **External (TestSprite 3.0):** portal suite against PR preview with real GitHub App trigger; automatic and repeatable.

## Canonical test IDs
| ID | Test | Assertion |
|--|--|--|
| UNIT-01 | Refund fixture vulnerable concurrency 2 | observed count 2, verdict fail scoped to fixture |
| UNIT-02 | Refund fixture fixed same vector | observed count 1, verdict pass scoped to fixture |
| UNIT-03 | Concurrency 1 | no forced fail from fixture label |
| UNIT-04 | Conflicting same key | fixed policy rejects or yields policy-compliant result |
| UNIT-05 | Input validation | invalid count / amount / idempotency key rejected |
| UNIT-06 | Repeatability | same seed/test vector -> same deterministic evidence |
| UNIT-07 | Source trust guard | AI cannot set verified status without executor result |
| UNIT-08 | Rejected model output | schema invalid -> honest error |
| INT-01 | POST lab valid | evidence ID + observations actually computed |
| INT-02 | POST lab malformed | no stale result, documented error |
| INT-03 | GitHub 404/429 | no fake analysis, appropriate message |
| INT-04 | GitHub oversized PR | explicit unsupported scope |
| INT-05 | Malicious repository instructions | no secret/tool takeover |
| INT-06 | AI provider timeout | `AI_UNAVAILABLE`/error, lab still works |
| INT-07 | File-line provenance | all cited paths/lines exist in fetched diff |
| E2E-01 | Home CTA | opens lab |
| E2E-02 | Vulnerable lab | genuine FAIL evidence |
| E2E-03 | Fixed lab same input | genuine PASS evidence |
| E2E-04 | Analyze invalid PR | error visible, input retained |
| E2E-05 | Small-mobile viewport | no horizontal scroll and controls usable |
| E2E-06 | Keyboard/focus/status | all critical operations accessible |
| TS-01 | Existing portal suite | executed, result link and count visible |
| TS-02 | Actual PR deployment | trigger after preview ready, correct URL |
| TS-03 | PR check | TestSprite bot status/comment visible in real PR |
| TS-04 | Regression loop | fix commit updates preview and reruns automatically |
| DOC-01 | Copy/provenance | no false accuracy/telemetry/verification claims |

## Negative controls required
- *Wrong business rule:* do not invent exact acceptance from ambiguous requirements; ask for interpretation inside UI or label assumption.
- *False positive:* pass fixture with no violation must not be red just because case is named vulnerable.
- *False negative:* genuinely duplicate effects must yield fail for rule expected <=1.
- *Provider down:* do not reuse prior successful AI output.
- *Test artifact forged:* a manually inserted screenshot cannot satisfy PR check gate.

## Release gate
No P0 test failures in reproducible local run; no critical security issues; no dead primary routes; TestSprite suite meaningful and actual bot comment/check attached to PR. If not true, reduce features and mark limitations, never fake green.

See `REFERENCE-TECHNICAL-BLUEPRINT/docs/08-qa-and-traceability.md` and `specs/quality-gates.json`.
