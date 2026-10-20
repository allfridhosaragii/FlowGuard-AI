# DEEPSEEK — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** Cost-aware coding, narrow refactors and adversarial second pass

**Relevant named models from Oct 20 research:** DeepSeek V4.1 Flash 1017 (verify exact endpoint and model ID). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Implement narrowly scoped fixture helpers, retry/idempotency utilities, input validators with tests; alternatively second-opinion Risk Hunter with read-only tools.

## Kelebihan untuk dibuat dominan

- Candidate for cost-effective TypeScript helper implementation and independent risk hypothesis.
- Community 10-task tests show competitive performance for some harness/effort settings.
- Useful second opinion from a different model family for bounded issues.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Community experiment indicated high token usage on some runs, so cost and latency need wall-clock measurement.
- Model/tool behavior varies substantially by harness and effort.
- As with any agent, may make tool requests that exceed safe access boundaries.

**Pagar pengaman wajib:**

- Limit iteration count, max output tokens and time; abort on excess use.
- Never allow access to `.env`, credentials, private user data or arbitrary shell.
- Do not treat cheap per-token price as cheap per correct fix without measured calls.
- Require reviewer in another model family before merging.

## Tugas konkret yang diserahkan ke model ini

1. Take one assigned issue with exact file ownership and test ID; no architectural refactor.
2. Write tests for duplicate requests, conflicting payload, invalid input and negative control.
3. Implement bounded utility code, then run test/lint/typecheck; report token/time/cost if available.
4. If used as Risk Hunter, output schema-bound POTENTIAL hypotheses only; never verdict.
5. Report any harness or version differences before comparing against GPT/Claude.

## Acceptance criteria & bukti yang WAJIB

- Test coverage for assigned utility
- No unsafe new dependencies
- Costs/latency logged if measured
- Zero unverified `VERIFIED` claims
- Code passes integrator build

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated DEEPSEEK engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Implement narrowly scoped fixture helpers, retry/idempotency utilities, input validators with tests; alternatively second-opinion Risk Hunter with read-only tools. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://www.reddit.com/r/LocalLLaMA/comments/1x8mq6f/deepseek_v41_flash_1017_vs_v41_flash_pi_vs/
- https://api-docs.deepseek.com/updates/

See `ORIGINAL-RESEARCH/DEEPSEEK.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
