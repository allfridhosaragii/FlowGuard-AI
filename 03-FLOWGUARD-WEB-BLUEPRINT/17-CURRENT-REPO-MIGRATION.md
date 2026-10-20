# Repository Baseline, Migration Strategy and No-Regression Rules

## Baseline verified on 20 Oct (must recheck before edit)
Repo `https://github.com/allfridhosaragii/FlowGuard-AI` was public on `main` with `README.md`, `index.html`, `index.css`, `index.js`, `package.json`, `vercel.json`. At prior inspection no PRs. Site `https://flowguard-ai-smoky.vercel.app/` existed. Existing site is static simulator: `index.js` `PRESETS` with hardcoded risk scores/findings/test snippets, a delay simulating inference and rotating "telemetry" text; no actual AI agent or backend/real test runner found. TestSprite generated 23 **planned** cases across 5 use cases, not evidence of passing.

## Immediate audit actions before coding
- `git status`, `git log -5 --oneline`, `git remote -v`, `ls -la`; check any new commits/PRs. Never overwrite newer unreviewed work.
- `npm ci` (if lockfile exists), inspect scripts, verify `index.js` behavior and deployed home in browser; take before screenshot and Vercel rollback link.
- Create branch `feat/refund-verification-mvp` from current main or protected baseline; save commit SHA in planning notes.
- Remove inaccurate claims: `99.8%` vulnerability catch, `<120ms` inference, `Zero-Day Anomaly Guard`, live daemon/telemetry, "TestSprite native bridge" unless actually implemented and measured. Current preset simulator can remain labeled explicitly as `Demo Simulation` ONLY if it does not obscure real lab.

## Migration options ranked
**Preferred:** replace existing static scaffolding with Next.js on feature branch, keeping Vercel repo/project; map visual layout into source-of-truth design tokens and real API.
**Fallback:** if migration consumes time or breaks preview, preserve static landing, implement minimal serverless trusted lab API and mobile lab UI, run tests, then consider Next after S4. Whatever chosen, document actual production stack; never claim Next if code remains HTML/JS.

## Safe commits / phases
- Commit 1: docs/scope, `.gitignore`, base scripts and CI skeleton, initial fixture test RED (intentional local regression test with controlled failure, not deployed sabotage).
- Commit 2: trusted fixtures and actual proof tests, API.
- Commit 3: UI and routing, error/loading/empty states.
- Commit 4: GitHub bounded reader, real LLM adapter, stage schemas.
- Commit 5: QA/hardening, refreshed TestSprite PRD/suite, deployment check.
Each commit should build; if not, isolate WIP from PR advertised as ready.

## Interaction with older TestSprite project
Do **not** delete TestSprite project gratuitously. Reexplore/regenerate suite after site changes; carefully migrate planned test cases. Preserve test evidence URLs and quota where appropriate. Confirm Vercel preview tests target the new routes and no tests assume old hardcoded simulator results. An unrelated green old suite does not show core new AI features are tested.

## Existing documentation/reference
Earlier complete blueprint preserved in `REFERENCE-TECHNICAL-BLUEPRINT`. Its source audit is `docs/15-current-state-audit.md` and is a **snapshot**, not guaranteed real-time.
