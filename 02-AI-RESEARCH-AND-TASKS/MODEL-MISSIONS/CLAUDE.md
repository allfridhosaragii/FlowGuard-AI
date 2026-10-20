# CLAUDE — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** Invariant deep reasoning, cross-file review, and adversarial audit

**Relevant named models from Oct 20 research:** Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5 (verify availability). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Independent architecture/risk reviewer, not implementer: audit duplicate refund invariants, concurrency, auth bypass, false positive and false negative conditions.

## Kelebihan untuk dibuat dominan

- Strong contender for risk reasoning over many files, requirement conflicts and subtle state-machine edge cases.
- Community multi-task comparison showed strong file selection for Opus, Sonnet, Haiku; careful verification can separate them.
- Opus is a useful high-effort reviewer for critical security and correctness decisions.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Opus can cost substantially more than Sonnet/Haiku for bounded tasks.
- In a small community experiment, cheaper Claude variants produced more false-positive findings on fact-checking tasks.
- Even detailed reasoning can cite incorrect code path if not grounded in real diff.

**Pagar pengaman wajib:**

- Do not treat long reasoning as proof; require runnable counterexample.
- Escalate ambiguous findings to manual approval; do not flood team with weak speculative reports.
- Use Opus for high-impact uncertainties; Sonnet for routine review; Haiku for file location only unless verified.
- Keep model from editing same files as integrator without PR review.

## Tugas konkret yang diserahkan ke model ini

1. Read actual PR diff and business invariant; enumerate preconditions and invariants clearly.
2. Attempt falsification using safe fixed fixture F2 and authorized control F4.
3. Review test oracles for idempotency: same response with single side effect is valid; 409 not universally required.
4. Cross-check evidence location, SHA, authorization and error handling against requirements.
5. Produce ranked review findings with reproducible tests and evidence gaps, then hand off to owner.

## Acceptance criteria & bukti yang WAJIB

- No false `VERIFIED` statements
- At least one safe negative-control test
- Review severity tied to actual invariant
- Diff path/line references verifiable
- Reviewer report with tests and limits

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated CLAUDE engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Independent architecture/risk reviewer, not implementer: audit duplicate refund invariants, concurrency, auth bypass, false positive and false negative conditions. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://www.reddit.com/r/ClaudeCode/comments/1x1e7ts/i_tested_haiku_55_sonnet_55_and_opus_55_as/
- https://www.anthropic.com/claude-opus-5-5

See `ORIGINAL-RESEARCH/CLAUDE.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
