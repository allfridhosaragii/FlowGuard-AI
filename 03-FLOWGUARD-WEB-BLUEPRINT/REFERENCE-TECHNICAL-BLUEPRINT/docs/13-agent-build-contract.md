# 13 — Instructions for Autonomous Coding Agent (Antigravity / Codex / Other)

## Task assignment

You are the implementation agent of **FlowGuard AI**. **Do not create a replacement repository, do not claim capabilities that are mockups, and do not automatically merge.** Work in the existing `allfridhosaragii/FlowGuard-AI` repository. The current production is a static browser simulator; preserve a rollback branch, then implement a real evidence-first MVP under `feat/refund-verification-mvp` with a preview deployment.

Read, in order: `README.md`, docs 02 scope, 04 architecture, 05 agents, 06 verification, 07 GitHub/TestSprite, 08 QA, 09 security, specs/openapi.yaml and specs/schema.sql. Source of truth is documented scope; disagreements must resolve by prioritizing safety, truthful status, P0 and running tests.

## Hard boundaries

1. Never invent performance, accuracy, test results, security claims or 'TestSprite native integration' APIs.
2. Never execute arbitrary user/remote PR code on Vercel, and never allow model output to become executable commands.
3. Build **first-party** synthetic lab with actual observed side effects, distinguishing vulnerable FAIL and fixed PASS for same input. Do this before polishing marketing/UI.
4. AI agents must make actual server-side provider calls and return schema-validated dynamic output when configured; if not configured, show an explicit error. Deterministic lab must still work.
5. GitHub public PR review is READ ONLY and outputs `POTENTIAL` findings only; source paths/lines must match fetched data. Never present local fixture proof as third-party PR verification.
6. Never expose secrets or run privileged workflows on untrusted PR code.
7. Keep deployed URL and GitHub history; work with Vercel preview and actual TestSprite GitHub App configuration (manual auth may require owner intervention).
8. If something cannot be implemented before deadline, document known limitation, hide deceptive button and prioritize core testing/PR check.

## Execution phases, in strict order

- P0A: Repo audit, npm scripts, test strategy, branch, Vercel preview.
- P0B: Refund fixture lab + Vitest test vector V-01..V-10 + API routes + evidence JSON.
- P0C: Responsive `/lab`, `/analyze`, report UI, no fake telemetry; Playwright smoke tests.
- P0D: GitHub PR diff reader with size and URL bounds, Zod validated 3-stage AI adapter + failure cases.
- P0E: Harden validation/security/rate limit, optional Neon persistence only if working.
- P0F: Update README/PRD, generate TestSprite suite, get actual Vercel PR preview, wire TestSprite GitHub App, capture bot result, fix fails.
- P0G: Demo + release checklist. Stop expanding scope.

## TDD execution protocol

For each `FR-*`: write test first, implement smallest code to pass, run tests locally, describe changed source file and current verified status. Use `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npx playwright test` when dependencies/scripts exist; create meaningful scripts with lockfile as needed. Verify failure cases, not only happy path.

## Final report format (agent MUST provide actual outputs)

```text
Commit/branch:
Files changed:
Feature acceptance IDs completed:
Commands run and exit codes:
Test counts and failures:
Vercel production/preview URLs verified:
GitHub PR link:
TestSprite check link and actual result:
Known limitations and risks:
Secrets exposed? (evidence/scan):
What remains before submission:
```

**Do not say '100% ready' because code compiles.** The product is ready only when each P0 gate is evidenced, including real external TestSprite PR check.
