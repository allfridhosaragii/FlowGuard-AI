# Execution Roadmap — 20–23 October 2026 / Critical Path

## Priority based on remaining time, not ideal enterprise architecture
Official Project Track closes **Thu Oct 22 23:59 PT / Fri Oct 23 13:59 WIB**. This leaves under 3 days at 20 Oct 2026 WIB. Build in small PRs and freeze scope early.

| Window (WIB) | Must produce | Exit evidence | Stop/cut if failing |
|--|--|--|--|
| 20 Oct — first half | Back up source, branch, remove fake stats, working build scripts, fixture lab | `npm ci`, build, unit tests, live lab fail/pass | Cut DB, extras |
| 20 Oct — second half | Lab API and UI responsive; Vercel preview from PR | screenshots, actual API results, preview URL | Cut dashboard/animations |
| 21 Oct — morning | GitHub public PR reader (strict), 3 AI stages with real provider adapter | actual source SHA, Zod output, errors handled | If provider unavailable, label experimental and preserve lab |
| 21 Oct — evening | Security review, negative tests, TestSprite suite refreshed for new app | tests pass locally, real portal test execution | Cut P1 and alternate models |
| 22 Oct — morning | Connect TestSprite GitHub App, configure ready event, create PR | actual TestSprite PR comment/check and target URL | **Do not polish UI until PR check works** |
| 22 Oct — evening | Fix bugs, rerun suite, README/demo, submission to Discord | working live URLs, PR with check, release checklist | Freeze features; no large refactor |
| 23 Oct — reserve | Final verify before 13:59 WIB | public links & Discord post verified | Only rollback-safe fixes |

## Hard gates
- **G1 Lab proof:** same vector vulnerable fail, fixed pass, actual API output.
- **G2 Dynamic AI:** 3 real model stages / correct Zod, one genuine PR risk hypothesis; if impossible, disclose incompleteness.
- **G3 Competition proof:** actual PR with Vercel preview and TestSprite auto check. Cannot submit as "complete" without it.
- **G4 Presentation:** 2-min working demo and README claim audit.

## Scope cuts in descending order
1. Remove persistent DB and history; return synchronous run results.
2. Remove nonessential theme/animations/chart metrics.
3. Remove extra security categories (JWT/SQL deadlocks); keep refund idempotency.
4. Remove own GitHub App/private repositories/OAuth entirely (never required P0).
5. Reduce number of model providers to ONE working server-side adapter; keep 3 agent roles prompts.
6. If GitHub diff analysis cannot reach acceptance, publish explicit experimental status; don't invent functionality.
7. Never cut the TestSprite App PR check or fake evidence to save time.

## Time budget assumptions, not promises
Local setup/migration 3–6 h; lab fixture and tests 4–8 h; UI 4–7 h; GitHub/API/AI 6–12 h; security/testing 5–10 h; TestSprite integration 2–5 h; docs/demo 2–3 h, with rework contingency. Combined may exceed available solo hours: choose parallel *nonconflicting* tasks and cut aggressively. Any planned hour is an estimate until agent measures it.

## Deployment safety
Keep `main` stable until PR checks. Do not delete old files on remote before new Next deployment works. Capture old Vercel target/project config. Rollback via known successful commit/deployment rather than resetting history. Do not force push the live branch.
