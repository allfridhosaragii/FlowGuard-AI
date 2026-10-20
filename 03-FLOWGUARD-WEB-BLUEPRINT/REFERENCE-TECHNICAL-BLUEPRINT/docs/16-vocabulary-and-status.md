# 16 — Terminology, Verification Status, Copy Rules

## Vocabulary

- **Business invariant:** a rule that must remain true across supported states and actions.
- **Risk hypothesis:** AI's evidence-linked theory that code could violate an invariant; not proof.
- **Counterexample:** specific input/ordering that, if executed, could violate an invariant.
- **Verification plan:** structured template ID + bounded parameters + expected observation.
- **Executed evidence:** actually observed input/output/state transitions from trusted runner with target attribution.
- **Fixture:** controlled synthetic first-party implementation, not the user's external production system.
- **TestSprite PR check:** TestSprite's own test suite running against FlowGuard app's deployed PR preview; independent of FlowGuard's lab.

## Status truth table

| status | Source of truth | When displayed | Must not imply |
|---|---|---|---|
| POTENTIAL | Agent with source-linked reasoning | Suggestive risk not executed against that target | Verified vulnerability |
| VERIFIED_FAIL | Trusted runner with observed violated invariant | Actual target/test run failed | All other targets similarly fail |
| VERIFIED_PASS | Trusted runner with observed satisfied invariant | A specified test passed on specific target/revision | Whole software is bug free |
| INCONCLUSIVE | Runner could not distinguish outcome | Interrupted/unsupported/incomplete evidence | PASS |
| ERROR | Application, data, network or model failed | Workflow failed operationally | PASS or semantic FAIL |
| UNSUPPORTED_SCOPE | Input exceeds declared test capability | Unrecognized library/test/PR too large | Tested and safe |
| AI_NOT_CONFIGURED | Missing valid server provider settings | Agent workflow unavailable | Agent working in 'demo mode' |

## Honest copy guardrails

- 'AI-powered' only on deployed mode where actual model calls are configured; otherwise mark AI features unavailable.
- 'Real-time telemetry' requires actual instrumentation; otherwise label static demos illustrative.
- 'Automatically verifies PRs' requires actual execution of changed PR code; do not use in P0 marketing.
- 'Finds hidden bugs' should be 'surfaces candidate risks; verifies supported cases'.
- 'Native TestSprite integration' only if a documented technical integration beyond the *external TestSprite GitHub App* genuinely exists.
- No fabricated catch-rate, accuracy, latency, user count, security compliance or zero-day coverage.
- Include caveat: 'External PR review yields hypotheses; the built-in lab demonstrates verification on controlled fixture code.'
