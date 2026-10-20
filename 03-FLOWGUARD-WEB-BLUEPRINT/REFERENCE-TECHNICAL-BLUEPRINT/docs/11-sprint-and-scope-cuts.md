# 11 — Critical Path: Oct 20–23, 2026 (WIB)

## Deadline (confirmed by organizer)

Project Track closes **Oct 22 11:59 PM Pacific**, equivalent to **Oct 23 13:59 WIB** while Pacific daylight time is active. Prefer submit by Oct 22 evening WIB. CLI bonus separate and not necessary for Project Track.

## Current baseline

GitHub: public repo, static HTML/CSS/JS simulation. Vercel URL exists. TestSprite project has PRD and **23 planned cases**, but no actual run or GitHub PR check established in screenshots. No PR currently returned by GitHub API at baseline. See 15-current-state-audit.md. Work from a new branch, keep old deployment rollback possible.

## Work breakdown, dependencies, and time boxes

| Priority | Work | Target owner | Rough time box | Exit condition |
|---|---|---|---|---|
| P0 | Freeze product and requirements | BA/architect agent | 1h | Docs and acceptance tests signed off |
| P0 | Connect Next.js branch to current Vercel repo | fullstack | 2–3h | Preview link works; production untouched |
| P0 | Build deterministic first-party vulnerable/fixed runner | backend | 3–5h | VER-01..VER-04 passing locally |
| P0 | Build `/lab` UI and evidence reporter | frontend | 3–5h | Mobile core flow reproducible |
| P0 | Build GitHub public PR diff reader (read-only) | backend | 2–4h | URL/size/404/rate error tests passing |
| P0 | Build three server-side bounded LLM stages | backend/AI | 4–7h | schemas, reasoned hypothesis with source refs, outage handling |
| P0 | Test unit/integration/API and E2E | QA | 4–6h | Release blocking test IDs green |
| P0 | Update PRD, TestSprite suite and ready-trigger PR integration | integration | 3–5h | At least one actual TestSprite PR report/check |
| P0 | README, cleanup false claims, demo, submission | release | 2–3h | All evidence linked, project submitted |
| P1 | Neon DB save/history | backend | 2–4h extra | Persisted run lifecycle works |
| P2 | Auth, own GitHub App, arbitrary repo execution, auto-fixes | later | defer | Explicitly out of scope |

**These are indicative estimates, not a promise of a one-person schedule.** Total P0 engineering could exceed remaining wall time. Parallelize only independent tasks and invoke scope cuts by gate times.

## Calendar and checkpoints

### Oct 20 — hard foundation

- Repo development branch and Vercel PR preview established.
- Remove misleading claims and faux telemetry.
- Build trusted fixture runner FIRST; run failing/passing local tests.
- Minimal UI `Lab` connected to executor.
- **Gate G1** (end of day): vulnerable FAIL/fixed PASS reproducible without AI.

### Oct 21 — differentiated AI behavior

- GitHub PR fetch and strict validation with seeded sample PR.
- Three bounded agent stages with real server-side model calls and JSON validation.
- Actual PR analysis shows potential only; no fake verification.
- Unit/API tests, negative tests, mobile UX.
- **Gate G2:** meaningful candidate hypothesis from real diff, plus no-LLM lab still functioning.

### Oct 22 — TestSprite and freeze

- Update TestSprite PRD/suite to match new app, execute core cases.
- Use real code PR with ready Vercel preview; TestSprite `Detect Events` -> active PR trigger -> bot comment/check.
- Capture real failing test then fix/rerun (if legitimate bug exists); do not force sabotage or fake log.
- Record demo; check README/provenance; freeze nonessential features.
- **Gate G3 by 18:00 WIB:** PR with TestSprite result and live production ready; finish Discord submission before sleep if possible.

### Oct 23 early WIB — reserve

- No migrations/large refactors. Verify links, suite and Discord post; finish before 13:59 WIB absolute deadline.

## Scope cut hierarchy — decisive, no repeated questions

If G1 misses: **stop PR integration feature**, finish first-party lab and independent TestSprite PR wiring. If G2 misses: keep agent behind truthful `Experimental/Unavailable` with provider errors and do not claim full AI delivered; submission only if core product still meets quality. If G3 misses: prioritize TestSprite PR integration above fancy UI, Neon database, agent tuning, secondary features and video polish. Never fabricate the green check.

## Roles for coding agents

- Architect/BA owns contracts and scope; Fullstack builds features; QA independently verifies actual behavior, checks logs/tests; Security reviewer finds unsafe execution/secret leaks; Release manager tests final PR. If only one agent is available, follow this exact order, do not start all tracks at once.

## Git branching policy

`main` protected as current live fallback; `feat/refund-verification-mvp` for core work; small PR(s), final large refactor only if tests and preview pass. Commit messages should identify true changed behavior. Don't push directly to main if you need PR evidence; don't auto-merge before TestSprite check.
