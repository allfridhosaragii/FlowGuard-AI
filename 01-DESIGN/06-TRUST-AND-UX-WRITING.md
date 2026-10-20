# Product Copy, Trust Taxonomy & Ethical UX

## Why this matters

FlowGuard exists to make software claims verifiable. A fancy dashboard with generated fake metrics destroys the product's value proposition. AI reasoning is evidence *hypothesis*, not experimental proof.

## Mandatory statuses

| Status | Permitted when | UI text |
|---|---|---|
| `POTENTIAL` | Reasoner suggests a risk, no proving test on referenced target | `Potential risk — not verified against this PR` |
| `VERIFIED_FAIL` | Real runner observed invariant violation on identified fixture/commit | `Verified failure in controlled test environment` |
| `VERIFIED_PASS` | Real runner observed invariant upheld on tested fixture/commit | `The tested scenario passed; other bugs may remain` |
| `INCONCLUSIVE` | Data, assertion or executor insufficient | `Inconclusive — insufficient verification evidence` |
| `ERROR` | Provider, API, runner or infra failed | `Could not verify; no verdict recorded` |

## Disclosure on report

Always show scope: controlled fixture vs external PR; SHA/test harness version; input parameter hash; execution time; number of attempts; side-effect count; errors/timeouts; evidence artifact reference. Put AI explanation clearly in a separate section labeled `AI interpretation`.

## Prohibited copy without hard evidence

`zero-day detection`, `99.8% vulnerability catch`, `<120ms inference`, `production-grade security guarantee`, `all bugs found`, `TestSprite native bridge` if not actually wired, `live telemetry` for timer-fed demo data, `verified against GitHub PR` when only local fixture executed.

## Writing principles

English public UI; Indonesian internal documentation acceptable. Use short active verb labels. Be transparent, not alarmist. Avoid generic slop: `revolutionary`, `game-changing`, `unprecedented`.
