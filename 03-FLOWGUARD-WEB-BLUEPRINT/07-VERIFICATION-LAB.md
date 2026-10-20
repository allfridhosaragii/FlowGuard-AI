# Verification Lab — Concrete Mechanics and Evidence Contract

## One invariant to prove
`INV-REFUND-001`: given a synthetic payment and fixed idempotency key, regardless of concurrent retries, the number of **committed refund side effects is <= 1**. This is not a formal guarantee of distributed exactly-once in production.

## Fixture pair and deterministic scheduler
- `vulnerable`: use explicitly controlled synchronization barrier so two requests *both read missing idempotency record* before either commits; each emits side effect; count 2 for crafted vector.
- `fixed`: atomically claim idempotency key *before any async wait* using a single-process lock/Map state machine; second identical request returns same logical outcome without additional side effect.
- These are first-party *synthetic demo fixtures* only; no real money, no real payment API, no third-party repository code executed.
- Reset state per run, unique payment IDs, stable seed/barrier ordering; test same vector on both fixtures.

## Example test vector
```json
{
  "fixture": "vulnerable",
  "paymentId": "pay_demo_001",
  "idempotencyKey": "retry-abc",
  "amountMinor": 125000,
  "concurrency": 2,
  "payloadMode": "same_amount",
  "iterations": 1
}
```
Values within bounds: concurrency 1..5; iterations 1..20; amount 1..1,000,000. For altered vector, observations must be computed, not copied from fixture name. With concurrency=1, vulnerable fixture can legitimately pass.

## Test matrix
| Case | Input | Expected correct rule behavior | Fixture design expectation |
|--|--|--|--|
| V-01 | vulnerable, concurrency 2 same key | exactly 1 side effect | violates: 2 effects |
| V-02 | fixed, same input | exactly 1 | satisfies: 1 effect |
| V-03 | vulnerable, concurrency 1 | <=1 | might satisfy: 1 |
| V-04 | fixed, concurrency 5 same key | exactly 1 | satisfies: 1 |
| V-05 | same key, differing amount | reject conflict | fixed rejects; vulnerable detection depends implementation |
| V-06 | no idempotency key | input validation error | neither fixture runs |
| V-07 | invalid concurrency 0 or 100 | 400 validation error | no run generated |
| V-08 | repeated identical run isolated state | same counts/seed for same inputs | reproducibility |
| V-09 | injected failure/timeout in harness | `ERROR` / `INCONCLUSIVE` | never `VERIFIED_PASS` |
| V-10 | fixture metadata | version/hash/time/run id present | provenance complete |

## Evidence (generated server-side)
```json
{
  "runId": "lab_run_unique_id",
  "targetType": "FIRST_PARTY_FIXTURE",
  "targetId": "refund-vulnerable-v1",
  "targetVersion": "sha256_or_commit",
  "invariantId": "INV-REFUND-001",
  "input": {"paymentId":"pay_demo_001","idempotencyKey":"retry-abc","concurrency":2},
  "expectedMaxEffects": 1,
  "observedEffects": 2,
  "verdict": "VERIFIED_FAIL",
  "executedAtUtc": "server_generated_timestamp",
  "notes": ["This verifies the bundled fixture, NOT an external GitHub PR"]
}
```
**Don't use literal fake timestamp/version in production.** Use computed values and real execution run ID. Include status and test runner error chain when appropriate.

## Precision of wording
- "Lab reproduced a duplicate refund on vulnerable *fixture*." — allowed.
- "FlowGuard verified a bug in your arbitrary GitHub PR" — forbidden for P0.
- "Both initial and patched fixture were executed with identical input" — allowed only after actual run.

## Exit gate
Run Vitest proof suites repeatedly (`npm run test`) and one Playwright end-to-end for toggle vulnerable/fixed; ensure no globally shared ledger between requests; no hard-coded status. See `REFERENCE-TECHNICAL-BLUEPRINT/docs/06-verification-engine.md`.
