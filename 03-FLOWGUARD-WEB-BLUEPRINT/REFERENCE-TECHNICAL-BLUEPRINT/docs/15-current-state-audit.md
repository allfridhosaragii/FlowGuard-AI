# 15 — Current-State Audit, 20 Oct 2026

## Verified from GitHub connection

Repository `https://github.com/allfridhosaragii/FlowGuard-AI` is public, default branch `main`. Directory listing at inspection: `README.md`, `index.html`, `index.css`, `index.js`, `package.json`, `vercel.json`. Latest listed commit: `4fd23df96b2b55a03fcda98026eb39f050d39252` (`docs: add verified live Vercel deployment link to README`). Pull request API returned `[]` at inspection.

## What code currently does

- `index.js` has a static `PRESETS` object (`payment_race`, `jwt_leak`, `db_deadlock`, `safe_flow`). Each preset contains hard-coded risk score, severity, summary, findings and assertion text.
- `runScan()` chooses a preset and, after a `setTimeout`, renders prewritten data. It does not infer from edited textarea content or make an LLM request.
- 'Real-time telemetry' in `index.js` is seeded text plus rotating `setInterval` demo messages, not backend observability.
- `index.html` contains unmeasured claims `99.8%`, `<120ms`, `Zero-Day`, 'TestSprite 3.0 Native Ready'. README also describes capabilities not proven by implementation.
- Displayed assertion code references API paths (`/api/checkout/settle`, etc.) and functions not available in current static repository. Not runnable evidence in existing app.
- `package.json` has only `dev` based on `npx serve` and a `deploy` script. No unit/E2E test scripts, no Node backend or AI agent implementation found in top-level repository.

## Verified from user TestSprite screenshots

- Account uses Starter plan with 550 credits shown at that time (may change).
- TestSprite project created for `https://flowguard-ai-smoky.vercel.app/`.
- Website feature exploration completed: one found page, four steps (screenshot).
- PRD uploaded and TestSprite generated a **plan of 23 tests across 5 use cases**. Screenshot at that point indicated tests were **not yet executed**.
- No evidence provided of a generated/running suite on a PR with GitHub App integration.

## Consequence

The existing site is a functional visual mock/demo with preset interactions. It is **not yet the proposed AI-Powered Bug Hunting & Risk Detection Platform**. Its best reuse is visual/layout elements and deployment continuity. TestSprite's existing 23 planned tests may need revision after the actual product is implemented. New claims require code and observed test evidence.

## Audit freshness caveat

This snapshot is based on current-turn GitHub connector responses and user screenshots, not a complete security audit of installed dependencies, live Vercel runtime or account settings. Re-check after every major deployment.
