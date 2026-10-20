# P0 Product Requirements, Acceptance Criteria, Release Scope

## Feature priorities
| ID | Priority | Deliverable | Acceptance criterion | Required proof |
|--|--|--|--|--|
| FG-F01 | P0 | Landing with honest CTA | CTA opens `/lab` and `/analyze`; no fabricated stats | E2E-F01 |
| FG-F02 | P0 | Lab inputs | fixture vulnerable/fixed, concurrency 1–5, retry/vector settings; bounds enforced | UNIT-L01, E2E-L01 |
| FG-F03 | P0 | Refund verification engine | vulnerable has >1 effect in targeted scenario; fixed has exactly 1, using identical input | VER-L01/L02 |
| FG-F04 | P0 | Evidence details | Fixture ID/hash, input, observed counts, expected invariant, execution timestamp & run ID | E2E-L02, API-L02 |
| FG-F05 | P0 | Requirement text | 10–2,000 chars, validation/errors; no silently invented rule | API-A01 |
| FG-F06 | P0 | Public GitHub PR fetch | strict github.com PR URL; repo/PR/sha/diff provenance; limited size | API-G01/G02 |
| FG-F07 | P0 | Three semantic AI stages | actual LLM response with schema validation and per-stage trace; no static preset output | AG-A01/A02 |
| FG-F08 | P0 | Risk status | external PR findings `POTENTIAL` only unless target code executed in future verified sandbox | SEC-TRUST01 |
| FG-F09 | P0 | Error and loading | invalid JSON, provider timeout, 404, rate limit never shown as PASS | E2E-E01..04 |
| FG-F10 | P0 | Mobile & a11y | 320,375,768,1024,1440 widths; keyboard/focus, screenreader status | UI-01..05 |
| FG-F11 | P0 | GitHub CI + preview | PR branch yields Vercel preview and test artifacts | CI-01 |
| FG-F12 | P0 | TestSprite PR check | portal test suite actually executes on PR preview; bot comment/check linked | CI-02..04 |
| FG-F13 | P0 | README & honest copy | public setup, scope, environment variables (names only), known limitations | DOC-01 |

**P1:** optional persisted reports, report export, second invariant fixture, server-configurable LLM. **P2:** private repos, own GitHub App, arbitrary repo execution sandbox, automated patching, multi-tenant auth, billing, generalized security scan.

## Demo preconditions
- Public homepage and lab accessible without auth (no test account required).
- Provider key configured securely on backend **or** AI analysis explicitly unavailable with lab still fully functional; cannot claim P0 full AI when provider absent.
- Non-real money: synthetic fixture only.
- Real input affects output; no "Run AI" button secretly mapping every custom input to fixed preset.

## Acceptance example — refund retry invariant
Human rule: "A settled payment can create at most one refund side effect for a given idempotency key, even with repeated requests." Test vector `(paymentId='pay_demo_001', key='retry-abc', amount_minor=125000, concurrency=2, fixtureVersion=<hash>)`:
- Vulnerable fixture: two concurrent requests intentionally both pass read-before-write checkpoint and each commit a refund → observed count 2 → `VERIFIED_FAIL` **for fixture only**.
- Fixed fixture: atomic key claim or idempotency ledger, exactly one committed refund → observed count 1 → `VERIFIED_PASS` **for fixture only**.
- Conflicting reuse of key with different amount: reject/flag; do not accept silent second refund.
- `concurrency=1` can PASS even in vulnerable fixture; don't hardcode risk score based solely on fixture name.

## Nonfunctional guarantees to implement, not claim prematurely
- Bounded API input + request duration + rate limiting; no unlimited cost from anonymous traffic.
- No credentials or raw PR patches in browser console, CI artifacts or analytics.
- Graceful provider absence/timeouts, error labels; no stale result reused as current.
- Stateless lab runner operates on isolated per-request state; no global persistent balance.

## Definition of Done per feature
1. Code integrated on feature branch with reviewable diff.
2. Acceptance ID has meaningful unit/integration/E2E test(s).
3. Both success and failure paths checked on real code (commands + exit codes).
4. Manual browser interaction confirmed at desktop/mobile.
5. UI and README accurately describe what has actually shipped.
6. No critical secrets/security issue and TestSprite regression check remains intact.
