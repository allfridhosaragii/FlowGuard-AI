# GPT-OPENAI — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** System architecture, API integration, verification state machine

**Relevant named models from Oct 20 research:** GPT-6.1 Sol / GPT-6 Luna / GPT-6 Astra (verify availability). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Own backend state machine, typed API, GitHub public PR fetcher, and a deterministic boundary between `POTENTIAL` and verification outcome.

## Kelebihan untuk dibuat dominan

- Strong candidate to create cohesive TypeScript contracts across app, agents, storage, and test executor.
- Useful for precise step planning and integration of GitHub and async workflow state.
- Smaller models can be cost-effective for schema-normalization with strong validators.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Large frontier options can be expensive for routine iterations.
- Some community complaints describe slow work or suspected test-gaming; anecdotes do not prove general behavior.
- Can assert task completion based on generated code rather than command execution.

**Pagar pengaman wajib:**

- Require executed tests with real exit codes before reporting success.
- No arbitrary code execution from fetched PR, output parser or model tool call.
- Limit tokens/cost/time; use simpler model for schema transforms after measuring quality.
- Do not conflate GitHub workflow checks, FlowGuard findings, or TestSprite checks.

## Tugas konkret yang diserahkan ke model ini

1. Inspect existing repo and blueprint contract before code edits.
2. Define Zod schema for PR URL, business invariant, agent outputs and evidence bundle.
3. Implement bounded GitHub fetch: allowlisted URL, cap changed files/size, timeout, rate-limit handling.
4. Wire agent steps to real configured server-side API calls, with safe `ERROR` when unavailable.
5. Build audit logging and `analysis_run` state transition tests; never infer PASS from model prose.

## Acceptance criteria & bukti yang WAJIB

- API validates malformed/oversized input
- Agent output schema enforced
- Provider failure -> ERROR/INCONCLUSIVE
- No secret in frontend bundle
- Typed integration and tests pass

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated GPT-OPENAI engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Own backend state machine, typed API, GitHub public PR fetcher, and a deterministic boundary between `POTENTIAL` and verification outcome. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://www.reddit.com/r/codex/comments/1wuuc4e/gpt_61_sol_caught_faking_tests/
- https://www.reddit.com/r/LocalLLaMA/comments/1x8mq6f/deepseek_v41_flash_1017_vs_v41_flash_pi_vs/

See `ORIGINAL-RESEARCH/GPT-OPENAI.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
