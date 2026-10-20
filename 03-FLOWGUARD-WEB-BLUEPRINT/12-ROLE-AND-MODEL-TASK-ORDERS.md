# Model-Specific Ownership, Task Orders and Anti-Conflict Workflow

## Core principle
The model-family recommendations are *experiment-informed assignments*; model availability/quality may change. Select whichever available model can demonstrate reliable work. **No model may self-award a PASS.** Use independent test runner and peer review.

## Orchestration owner / integration discipline
One maintainer (human or nominated coding agent) owns `main`, final scope and merge. Each model gets one bounded issue/task and one branch; no simultaneous uncontrolled writing to shared source paths. After each task provide `changed files, commit SHA, tests actually run, failures, remaining risks`.

## Seven families: role assignments
| Family | Primary job (best use in this project) | Prevent weakness | Concrete output | Independent reviewer |
|--|--|--|--|--|
| Gemini | UX, responsive components, screenshot-based layout audit | Must use design tokens, accessibility tests; no beauty-only CSS | `/`, `/lab`, `/analyze` responsive UI + E2E UX | GPT/Claude |
| GPT | End-to-end architecture, API Zod, typed integration, release coordination | No huge speculative refactors; run tests after each route | API + orchestrator + integration tests | Claude |
| Claude | Security, invariant reasoning, independent red-team and edge cases | Cite exact code lines; no unexecuted vulnerability called verified | 10 high-risk scenarios + severity/provenance review | GPT |
| DeepSeek | Small isolated backend utilities, validators, refactoring | Bounded file ownership, unit tests, catch schema mistakes | PR parser + validated helper functions | GPT/Claude |
| Qwen | Deterministic fixtures, test generation, negative test variants | Every generated test must execute and include meaningful assertions | Fixture tests + V-01..V-10 | GPT |
| Kimi | Cross-file consistency, requirement-to-code audit, missing-state discovery | Require file/line and rule IDs, never infer execution from docs | gap audit with precise file paths | GPT |
| Z.ai/GLM | Alternative attack/counterexample hypothesis, QA robustness | Distinguish suggestions from evidence; avoid duplicating competing patches | red-team hypotheses + supporting tests | Claude |

## Task tickets (ordered, NOT seven agents coding simultaneously)
**TASK-A: Repo & migration (GPT or integrator)** — inspect existing index.js hardcoding; set branch, scripts, lockfile, Next scaffold or incremental migration with rollback; build succeeds. Stop if production link is broken and rollback.
**TASK-B: Trusted verification lab (Qwen/DeepSeek + GPT review)** — implement V-01..V-10, same input vulnerable/fixed, real assertions and evidence. Gate: local FAIL/PASS genuine and deterministic.
**TASK-C: UI against typed API (Gemini + GPT review)** — minimal usable routes and status taxonomy per design docs. Gate: mobile/keyboard E2E, no fake metric.
**TASK-D: GitHub public PR ingestion (GPT/DeepSeek)** — strict URL, bounded diff, real SHA, rate/error paths. Gate: actual public PR metadata and mocked failures tested.
**TASK-E: Real 3-stage AI (GPT + Claude review)** — schema-validated model calls, stage trace, dynamic output, attribution; provider outage explicit. Gate: prompts + real provider integration test + source-backed finding.
**TASK-F: Security/red-team (Claude/Kimi/Z.ai)** — audit threat matrix; verify no arbitrary execution or prompt injection privilege escalation. Gate: all S-01..S-10 with evidence.
**TASK-G: TestSprite PR loop (integrator)** — attach required external App, create preview PR and bot check; gate: actual link, no screenshot substitution.
**TASK-H: Demo and submission (integrator + Gemini polish)** — story, README, live links, screen recording only after prior gates.

## Handoff template (REQUIRED for each ticket)
```text
Ticket / role / model+version actually used:
Branch & latest commit SHA:
Files created/changed (precise paths):
Acceptance IDs addressed:
Design/API contracts modified:
Commands executed + exit codes:
Unit/integration/E2E outcomes (counts and logs):
Runtime preview URL, when applicable:
Known unresolved bugs / security concerns:
Peer reviewer requested:
Ready for merge? why / why not:
```

For detailed per-model advantage/limitation/prompts read `../02-AI-RESEARCH-AND-TASKS/MODEL-MISSIONS/<FAMILY>.md`. Never hardwire an unverified specific 2026 model name into code.
