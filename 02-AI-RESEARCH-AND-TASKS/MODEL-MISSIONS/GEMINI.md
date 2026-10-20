# GEMINI — Dedicated Model Mission & Anti-Failure Playbook

**Intended capability focus:** Fast visual engineering, exploratory architecture, and Antigravity iteration

**Relevant named models from Oct 20 research:** Gemini 4 Argon / Gemini 3.8 Flash (verify accessible model label). Actual model availability, version, pricing and context limits must be verified in the working account before running.

## Priority mission (not optional)

Own UX implementation for `/`, `/lab`, `/analyze`, `/about` and make the evidence model intelligible, focusing mobile 320–390px before desktop polish.

## Kelebihan untuk dibuat dominan

- Strong candidate for exploring multiple UI directions, layout composition, and fast frontend iterations.
- Broad-context exploration and architecture sketches; useful for checking interactions between page design and technical constraints.
- Can rapidly propose browser-centric prototypes when real browser inspection is available.

**Cara memperkuat:** gunakan kekuatan itu pada tugas berukuran tepat, jadikan output sebagai artefak nyata (diff, schema, test, UX proof), simpan eksperimen dan lakukan review lintas-model. Jangan hanya mengulang klaim keunggulan.

## Kelemahan / kebiasaan gagal yang harus ditekan

- Published single-prompt community comparison found Argon did not complete browser verification even when implementation finished.
- Reports of quota exhaustion in some Antigravity accounts, not a universal entitlement or hard number.
- Can choose stale libraries or stop after an attractive untested UI.

**Pagar pengaman wajib:**

- Do not claim browser checks occurred unless browser automation report/screenshots exist.
- Reject old/vulnerable versions of Three.js/dependencies: use versions already pinned or verify current lockfile.
- Timebox work; prefer small PR per screen and record tool/quota use.
- No fake live chart, timing counter, or AI avatar.

## Tugas konkret yang diserahkan ke model ini

1. Read all `01-DESIGN/*.md`; summarize route/component plan before coding.
2. Implement accessible responsive page components with actual API contract, do not invent endpoints.
3. Create and verify clear potential-vs-verified badges plus source scope.
4. Test buttons, keyboard, browser navigation, validation, and error states in real browser.
5. Deliver responsive screenshot artifacts and Playwright scripts using project stack.

## Acceptance criteria & bukti yang WAJIB

- UI-01/02 navigation live
- UX-01/02/07/10/12/13 checks run
- No horizontal overflow 320px
- All new copy honors provenance taxonomy

Minimal report harus mencantumkan: assigned task ID; exact model+provider+effort; files read+changed; branch+commit; commands executed+actual exit codes; discovered failures; mitigation applied; what is `NOT_RUN`; artifact/evidence; reviewer.

## Prompt siap tempel ke agent

```text
You are the designated GEMINI engineering agent working on **FlowGuard AI**, repo https://github.com/allfridhosaragii/FlowGuard-AI. First read `01-DESIGN/00-START-HERE.md`, all relevant design specs, `02-AI-RESEARCH-AND-TASKS/01-MULTI-MODEL-WORKFLOW.md` and `02-QUALITY-GATES.md`, then inspect the actual current GitHub branch. Your assigned primary mission: Own UX implementation for `/`, `/lab`, `/analyze`, `/about` and make the evidence model intelligible, focusing mobile 320–390px before desktop polish. Do not invent test results, metrics, commits, API endpoints or model capability. Your work MUST exploit your family’s useful strengths while actively counteracting the listed failure modes through controls. Work on a scoped branch; do not overwrite other agent work or push main. Follow source-of-truth requirements and security boundaries. For every meaningful claim provide source file/line or real test run. Validate with lint/typecheck/unit/E2E as applicable; status NOT_RUN if unavailable. Return exact commit SHA, files changed, acceptance IDs, executed commands and exit codes, evidence, unresolved risks, and next owner/reviewer. In critical-risk work prefer deterministic test evidence over consensus from other AI agents.
```

## Sources / research provenance

The following are background research links, not proof the current FlowGuard repo is working. Community reports may be one-off and need local reproducible evaluation.

- https://www.reddit.com/r/ClaudeCode/comments/1x56wuh/gemini_4_argon_vs_claude_opus_55_same_prompt_tiny/
- https://www.reddit.com/r/google_antigravity/comments/1x73yrd/my_thoughts_about_argon_4_in_antigravity_pro_user/

See `ORIGINAL-RESEARCH/GEMINI.md` for the previous research notes and limitations. Use `04-MODEL-EVALUATION.md` to compare alternatives fairly.
