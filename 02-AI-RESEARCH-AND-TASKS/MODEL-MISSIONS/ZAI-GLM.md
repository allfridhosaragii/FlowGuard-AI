# ZAI-GLM — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** Alternative agentic bug audit, schema robustness, open-weight trade-off review

**Relevant named models from Oct 20 research:** GLM-5.3 / GLM-5.3 Flash / GLM-5.2 (verify model and thinking API settings). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Independently stress-test agent API contracts and false-positive controls; propose competing explanations for risk findings and verify integration error handling.

## Kelebihan untuk dibuat dominan

- Candidate alternative for tool-assisted engineering and independent risk review.
- Open-weight/flash options can support cost-control studies with appropriate infra.
- Community self-hosting experiments provide reproducibility clues about harness issues.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Vendor benchmarks may use harnesses not equivalent to FlowGuard.
- Thinking flags, model routing and GPU configuration can break requests or change performance.
- Token efficiency does not always translate into faster measured wall-clock execution.

**Pagar pengaman wajib:**

- Verify provider-specific thinking/reasoning settings instead of copying flags between models.
- Do not infer superiority from vendor-only benchmark; replicate with FlowGuard fixtures.
- Strict tool allowlist, timeout, low retry cap and read-only PR access.
- Keep independent reviewer role unless explicit change authorization.

## Tugas konkret yang diserahkan ke model ini

1. Test output-schema adherence with malformed/ambiguous user stories.
2. Check risk review does not flag safe idempotent retry F2 or authorized F4 as bugs.
3. Audit timeout, provider rate limit, tool invocation, retry and recovery paths.
4. Compare competing risk hypotheses to actual runner evidence, not model agreement.
5. Report exact endpoint, reasoning flags, infrastructure and task budget.

## Acceptance criteria & bukti yang WAJIB

- Schema invalid response handled safely
- False positive controls tested
- Timeout/error states not PASS
- Task budget logged
- Evidence-backed independent review

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated ZAI-GLM engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Independently stress-test agent API contracts and false-positive controls; propose competing explanations for risk findings and verify integration error handling. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://github.com/PixelML/GLM-5.3-Flash-CMP-170HX
- https://z.ai/blog/glm-5.3

See `ORIGINAL-RESEARCH/ZAI-GLM.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
