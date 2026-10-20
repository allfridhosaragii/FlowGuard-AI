# 06 — Trusted Verification Lab, Reproducibility and Evidence

## Goal

Convert a **supported business invariant** into an executed experiment that shows whether a trusted synthetic implementation violates the rule. The lab's trust boundary must be obvious: it does **not** run the user's arbitrary repository code, does **not** prove bugs in unrelated GitHub projects, and does **not** operate on real payments.

## Invariant REFUND-001

For a given `(paymentId, idempotencyKey)`, retry or concurrent duplicate requests must produce **at most one committed refund ledger entry**. Different request payload with same idempotency key must not silently add a second refund. HTTP status may be 200/201/409 depending on API design; actual ledger side-effect is decisive.

## First-party fixture designs

### Vulnerable version

State keyed by `(paymentId,idempotencyKey)` and synthetic ledger in an isolated per-run object. Each of two parallel calls reads `hasRefunded=false`, waits on a deliberate test-only synchronization barrier so **both** read before either writes, then each appends a refund entry. This yields two effects deterministically with no timing luck. It represents a simplified read-before-write bug.

### Fixed version

Each call attempts an atomic synchronous `claim(key)` in the in-memory fixture before any `await`; only winner appends the ledger entry. Duplicates return the prior result (or deterministic duplicate response) but never another effect. This shows **single-process** idempotency, not a guarantee across multi-instance distributed databases. Production would need a unique DB constraint/transactional idempotency mechanism; roadmap only.

## Execution algorithm

1. Validate fixture ID (`refund.vulnerable.v1|refund.fixed.v1`) and input numbers.
2. Create isolated in-memory state (per run), deterministic IDs and seeded fixtures; redact request key in displayed reports if sensitive.
3. Launch 1..5 logical concurrent requests with same key; use synchronization barrier for vulnerable case, synchronous claim for fixed.
4. Collect resolved/rejected responses and committed `ledgerEntries` with event sequence index.
5. Determine `observed_effect_count`, compare against maximum = 1; derive `VERIFIED_FAIL` if >1, `VERIFIED_PASS` if <=1 and expected scenario actually executed, otherwise `INCONCLUSIVE`/`ERROR`.
6. For N iterations, reset state each time. A failed iteration makes aggregate verdict FAIL; errors never count as PASS.
7. Include template version, fixture source hash, inputs, SHA-256 of canonical evidence payload, start/end UTC time, execution target, count per iteration, and test run ID.

## Critical edge cases

| ID | Input | Expected vulnerable | Expected fixed |
|---|---|---|---|
| V-01 | One request | PASS (one entry) | PASS |
| V-02 | Two same-key concurrent requests | FAIL (two entries) | PASS (one entry) |
| V-03 | Five same-key concurrent requests | FAIL (five entries) | PASS |
| V-04 | 20 repeated trials N=2 | Every trial FAIL | Every trial PASS |
| V-05 | Same key, conflicting amounts (payload_mode=conflicting_amounts) | Explicit rejection/flag per fixture policy | Explicit rejection, never second refund |
| V-06 | Distinct keys with documented separate intents | Behavior per synthetic policy, no false duplicate verdict | Behavior per synthetic policy |
| V-07 | Missing payment identifier | Validation error, zero effects | Validation error |
| V-08 | Invalid concurrency N=0, 6, 1.5 | Validation error | Validation error |
| V-09 | Evidence output serialization | Valid JSON with run ID and canonical hash | Valid JSON with run ID and hash |
| V-10 | Injected 'pretend PASS' in note | No change to runner verdict | No change |

**Important:** V-01 proves no failure for a trivial non-concurrent case. This prevents claiming all runs are failures merely because the fixture is called vulnerable.

## Verification target binding

Every execution has an immutable target identity in the report:

- `target_kind`: `FIRST_PARTY_FIXTURE` (P0) or future `DEPLOYED_APP`/`ISOLATED_REPO`
- `target_id`: fixture ID and version; `target_revision`: SHA-256/source commit hash
- `rule_id`, `test_template_id`, `test_template_version`
- `run_id`, `run_started_at`, `run_finished_at`
- `inputs`, `observed_effects`, `individual_attempts`, `outcome`, `evidence_sha256`

Evidence hash provides accidental-corruption detection and traceability, **not tamper-proof attestation**. Without signed trusted storage it must not be described as immutable or independent verification.

## AI and runner separation

Agent 3 suggests scenario parameters but runner independently validates them and computes all results. Template catalogue is hand-reviewed and versioned. Never use `eval`, `new Function`, user-uploaded Playwright files, externally supplied webhook URLs or arbitrary npm commands in production. Refuse unsupported test types with status `UNSUPPORTED`, not fake generated code.

## TestSprite interface

TestSprite runs its **own** E2E/API suite against FlowGuard's live/preview site. It is not necessarily executing FlowGuard's generated scripts and there is no assumption of a native TestSprite 'assertion ingestion' endpoint. In MVP, agent plans are exported as plain structured test specifications; actual S4 quality evidence comes from TestSprite PR runs of FlowGuard itself.

## Demo script expected observations

- Vulnerable N=2 same key -> two committed synthetic refunds, `VERIFIED_FAIL`.
- Fixed N=2 same key -> one committed synthetic refund, `VERIFIED_PASS`.
- Edit key or N=5 -> actual runner inputs and observations change consistently.
- Provider offline -> lab still computes verdict; PR risk analysis labels provider error, not PASS.
- Tests recording these states execute from UI/browser and API.

## Out of scope

Distributed locks across workers, non-deterministic stress testing, live banks/payments, external PR execution, arbitrary test generation/execution and 'zero-day' scanning.
