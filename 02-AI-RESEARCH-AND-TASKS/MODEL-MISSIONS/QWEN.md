# QWEN — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** Controlled test writing, reproducible open-weight/local experimentation

**Relevant named models from Oct 20 research:** Qwen3.8-Max / Qwen3.8-27B / Flash-Next (verify provider and hardware). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Create reproducible test harness components for idempotency, negative controls and runner evidence; optionally benchmark local inference with pinned environment.

## Kelebihan untuk dibuat dominan

- Open-weight options provide greater deployment control for some tasks.
- Practical candidate for producing isolated Vitest fixture tests and deterministic validators.
- Community projects demonstrate successful coding under certain hardware/harness combinations.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Local quantization, GPU throughput, prompt length, sampling and agent harness materially affect quality.
- A Tetris executable task produced both failures and successes under different setups.
- Big model benchmark and marketing statements do not imply repeatable PR bug discovery.

**Pagar pengaman wajib:**

- Don’t equate compiling code with verifying runtime concurrency semantics.
- Pin hardware/quant settings for A/B comparison; label unsupported hardware as not tested.
- Never fabricate a deterministic concurrency failure via UI manipulation; test must observe side effects.
- No shell command from external repo is authorized.

## Tugas konkret yang diserahkan ke model ini

1. Implement deterministic synthetic ledger fixtures from acceptance INV-REFUND-001; no production payment calls.
2. Add Vitest tests for vulnerable failing case, fixed passing case, safe retry control.
3. Record exact commands, seed/barrier technique, side effect count and attempt IDs.
4. If self-hosted, record quantization bits, engine version, GPU memory, temperature, throughput.
5. Propose efficiency optimizations only if they preserve test oracle validity.

## Acceptance criteria & bukti yang WAJIB

- At least 3 repeatable local runs in fixture CI
- Same params vulnerable FAIL fixed PASS
- Negative control safe fixture stays safe
- Environment/harness recorded
- Independent integration review

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated QWEN engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Create reproducible test harness components for idempotency, negative controls and runner evidence; optionally benchmark local inference with pinned environment. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://www.reddit.com/r/LocalLLaMA/comments/1x7uf15/i_dont_get_the_qwen_38_flash_next_hype/
- https://qwen.ai/blog?id=qwen3.8

See `ORIGINAL-RESEARCH/QWEN.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
