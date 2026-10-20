# 08 — QA Plan, Test Matrix, Execution Evidence and Release Gates

## Layered testing

1. **Unit (Vitest):** input schema, invariant evaluator, deterministic lab state machine, agent stage output schemas, URL validator, finding provenance.
2. **Integration (Vitest + mocked provider/GitHub):** API failures/limits, agent orchestration, source binding, persistence fallback, missing LLM.
3. **First-party fixture behavior:** vulnerable/fixed same inputs with run evidence; positive, negative, boundary and multiple concurrency cases.
4. **E2E (Playwright):** landing, lab, PR review UI, loading/error states, keyboard navigation, mobile layout, copy/export.
5. **Independent TestSprite 3.0 suite:** run against actual PR preview on every PR, verify failure gate and rerun.

## Requirement-to-test traceability

| ID | Test | Type | Requirements | Expected result |
|---|---|---|---|---|
| UI-01 | Landing hero and CTAs | E2E/TestSprite | FR-01 | Links navigate correctly |
| UI-02 | No fictional metrics or telemetry | Manual+E2E | FR-01, FR-11 | No unsupported claims |
| UI-03 | Keyboard-only main journey | E2E | FR-12 | Focus usable, buttons operable |
| UI-04 | Mobile 320/375/390 viewport | E2E | FR-12 | No horizontal overflow, no clipping |
| UI-05 | Error and progress aria status | E2E | FR-12 | Screen reader compatible notifications |
| UI-06 | Evidence shows scope disclaimer | E2E | FR-07 | Lab fixture evidence not confused with PR |
| LAB-01 | Two concurrent requests, vulnerable | Unit/API/E2E | FR-02, FR-03 | Two effects, VERIFIED_FAIL |
| LAB-02 | Same inputs, fixed | Unit/API/E2E | FR-02, FR-03 | One effect, VERIFIED_PASS |
| VER-01 | Single request vulnerable | Unit | FR-03 | One effect, PASS (avoid hardcoded FAIL) |
| VER-02 | 5 concurrent requests each variant | Unit | FR-03 | Vulnerable >1, fixed =1 |
| VER-03 | Evidence links exact run/target/hash | API | FR-07 | Valid provenance and no cross-target attribution |
| VER-04 | Malformed params, boundary | Unit/API | FR-03 | 400, no side effect |
| AG-01 | Rule missing/too large | API | FR-04 | 400 or structured needs input |
| AG-02 | Three stages output valid schemas | Integration | FR-05 | Parser passes, cross references valid |
| AG-03 | LLM says 'verified' | Unit | FR-05 | Ignored; remains POTENTIAL |
| AG-04 | Provider timeout / invalid JSON | Integration | FR-08 | Explicit error, no fabricated verdict |
| AG-05 | Prompt injection inside diff | Integration | FR-05, FR-09 | Policy remains binding, no command execution |
| GH-01 | Valid public GitHub PR diff | Integration | FR-06 | Commit/paths/lines reflect GitHub |
| GH-02 | Invalid URL, 404, 403, 429 | Unit/Integration | FR-06 | Rejected/handled safely |
| GH-03 | Oversized diff | Integration | FR-06 | UNSUPPORTED_SCOPE, no silent partial proof |
| API-01 | All payloads schema-validated | Unit | FR-04 | Valid 2xx, invalid 4xx |
| API-02 | Network/DB/LLM errors | Integration | FR-08 | Correct 5xx/429/503, not green |
| SEC-01 | API key absence in browser bundle | CI grep/manual | FR-09 | No secrets exposed |
| SEC-02 | GitHub SSRF/protocol attempts | Unit | FR-09 | URL parser rejects |
| SEC-03 | Request limit and payload bound | Integration | FR-09 | 429/413 as appropriate |
| SEC-04 | User content encoded on rendering | E2E | FR-09 | No script execution |
| SEC-05 | External test command rejection | Unit | FR-09 | Unsupported test template refused |
| SEC-06 | Owner check + repo allowlist | Integration | FR-09 | Cannot use app to access private unauthorized repo |
| CI-01 | Vercel PR preview ready | External manual | FR-10 | Unique reachable preview URL |
| CI-02 | TestSprite GitHub App installed | External manual | FR-10 | Active trigger connected to correct repo |
| CI-03 | TestSprite comment/check on PR | External external | FR-10 | Real check visible after preview ready |
| CI-04 | Fix commit reruns TestSprite | External external | FR-10 | Fail->pass record from same PR |
| DOC-01 | README claims true | Manual | FR-11 | Describes limitation and actual shipped features |

## Tester-owned acceptance constraints

- **Never** intentionally remove a failing test to make a score green. If a test is incorrect, document reason and replacement test with same behavior coverage.
- At least one end-to-end public, no-login user journey must be independently reproducible by reviewer.
- TestSprite checks must assert meaningful outcomes: actual refund entry count/status/explanation, not merely clickability and page load.
- AI free-form text is not a brittle E2E assertion; assert verified schema shape, provenance and presence of explicit status/sections. Deterministic lab assertions should be exact.
- Fixture tests must not depend on actual wall-clock timing or global process state.
- Each P0 requirement maps to a test ID; all release-blocking tests green on target commit.

## Performance and nonfunctional tests

- Real lab median and p95 measured from actual run, not guessed; goal p95 <2s for controlled in-memory replay (target; verify).
- Agent analysis target <45s within active serverless limits; timeout must surface correctly.
- Mobile Core Web Vitals need real Lighthouse evaluation; do not claim specific scores until measured.
- Verify browser latest Chrome, Safari, Firefox at least smoke tests; document if unable.

## Test run evidence template

`run_id`, `commit_sha`, `preview_url`, `test_suite_revision`, `test_case_id`, `started_at`, `finished_at`, `result`, `failure_log_reference`, `retry_of`, `test_executor_version`, `reviewer_notes`. For TestSprite external runs, link official PR check and portal; don't duplicate or forge reports.

## Ship/block decision

**BLOCK:** uncontrolled code execution, leaked API key, fixture evidence contradicts status, 'verified' generated by LLM alone, public broken primary flow, no TestSprite PR check, no live preview, README false product claims, critical E2E failure.

**WARN with transparency:** unsupported external PR testing (deliberate MVP limitation), AI provider unavailable with working lab, noncritical copy/layout issues or missing post-MVP dashboard features.
