# Benchmark Protocol — Verify the Research on FlowGuard Itself

The original research includes community tests and provider announcements; these do not replace local A/B experiments. **No benchmark results are claimed in this ZIP.**

## Six real-world fixture classes (controlled synthetic, not actual financial operations)

| ID | Truth label | Scenario |
|---|---|---|
| F1 | Vulnerable | Duplicate refund via repeated key with missing atomic claim |
| F2 | Safe | Same key repeated safely returns same business result once |
| F3 | Vulnerable | Refund allowed for unauthorized role |
| F4 | Safe | Valid authorized refund path, no planted bug |
| F5 | Vulnerable | Concurrent inventory decrement oversells last unit |
| F6 | Safe validation | Invalid input rejected without side effects |

## Fairness

- Pin fixture SHA, exact model ID/version, endpoint, toolset/harness, effort, seed when possible.
- Same prompts, input scope, max tool budget, time limit, scoring rubric. Record differences explicitly.
- Each fixture at least 3 independent runs/model (resources permitting). Never make strong rankings from 1 run.
- Evaluate coding and bug finding separately. Never reward excessive unverified findings.

## Metrics

- Verified recall, precision, false-positive rate on safe fixtures, schema compliance, tool-call success.
- Time-to-verified-bug p50/p95, tokens total, billed USD, run variance, repair pass rate.
- Include 0-test and unsupported-case failures; report `NOT_RUN` rather than imputing success.

## Experiment record

```json
{"model":"exact-id","endpoint":"provider","fixture":"F1","commit_sha":"...","harness":"...","run":1,"reasoning_effort":"...","time_s":null,"input_tokens":null,"output_tokens":null,"cost_usd":null,"proposed_finding":null,"verified":null,"false_positives":null,"test_command":null,"test_exit":null,"evidence_uri":null,"notes":"NOT_RUN"}
```

## Selection policy

- Choose the most reliable model for each agent role, not necessarily the newest or most expensive.
- Prefer verified correctness per dollar, low false-positive rate, and reproducibility.
- Reserve cheaper models for bounded/testable transformations; escalate suspicious or ambiguous findings.
- If a third-party benchmark conflicts with local measurements, document harness/reasoning/version differences.
