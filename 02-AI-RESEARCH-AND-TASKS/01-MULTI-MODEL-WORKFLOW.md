# Multi-model Workflow — Anti-conflict Orchestration

## Single source of truth

- Product scope: docs `02-scope-and-requirements.md`, `06-verification-engine.md`, and `/01-DESIGN` from this ZIP.
- Repository: https://github.com/allfridhosaragii/FlowGuard-AI
- Master integrator is **one assigned agent/human maintainer**; all others submit independent patches/reviews, not concurrent writes to `main`.
- Stage gate priority: working controlled lab → real API/AI → traceable results → PR TestSprite check → polish.

## Role & ownership matrix

| Family | Primary mission | File ownership (suggested) | Reviewer (different family) |
|---|---|---|---|
| Gemini | UX flows, responsive UI, design tokens | `src/components`, `src/app` presentational | Claude or GPT |
| GPT | Architecture, API contracts, integration | `src/lib`, `src/app/api`, orchestration | Claude |
| Claude | Invariant analysis, red-team review, security | Read-only review docs/tests; patches by request | GPT |
| DeepSeek | Focused TypeScript utility implementation | Test fixture support, isolated helpers | Claude or GPT |
| Qwen | Deterministic testcase writing, test tooling | `src/tests`, `fixtures` on designated task | GPT |
| Kimi | Large-repo impact analysis and cross-file consistency | Read-only audit reports | GPT |
| Z.ai | Alternative risk hypothesis and negative controls | Read-only audit/tests proposal | Claude |

Ownership is task-based, not because provider is intrinsically better. Changing assigned role requires benchmark evidence or maintainer decision.

## Branch and integration

- `main`: protected manually; no agent pushes directly.
- Use `feat/<scope>-<agent>` branch per issue with one issue ID and acceptance criteria.
- Every agent must produce: changed paths, commit SHA, rationale, tests executed + exit codes, known risks. PR review and merge by maintainer; no silent force push.
- Reviewer must not evaluate its own generated test as independent proof. Use third-party executor + human validation.

## Sequence

1. GPT/Gemini create architecture and UX spec **without modifying shared files in parallel**.
2. Implement first-party vulnerable/fixed refund test harness with a deterministic replay and reproducible logs.
3. GPT orchestrator + Claude review shape AI contracts; selected available model used for real server-side calls.
4. Other families test model output reliability on six controlled fixtures; validators reject malformed JSON.
5. Gemini integrates frontend against stable typed API, not guessed endpoints.
6. TestSprite Web Portal suite → GitHub App → preview PR check → fix → rerun; capture evidence.

## Stop conditions

- No available LLM key/model -> say unavailable; controlled lab can run independently.
- No verified sandbox -> never execute repo-supplied arbitrary commands.
- No source-located evidence -> only `POTENTIAL`.
- Missing API contract/schema mismatch -> stop merge.
- Safety/privacy failure -> block deploy, remove secrets and rotate if exposed.
- Missing TestSprite PR check -> not competition-ready.

## Limited time

For Season 4 project cutoff Oct 22 2026 23:59 PT = Oct 23 13:59 WIB. Prioritize one entire end-to-end verified story. Multi-model research should never block core hackathon submission.
