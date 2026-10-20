# Developer Task Board — Executable Tasks & Merge Gates

## P0 tasks as ticketable work
| Ticket | Owner role | Depends on | Work product | Acceptance/evidence |
|--|--|--|--|--|
| P0-001 | Integration/GPT | none | current-state re-audit, backup SHA, feature branch | no lost changes; preview path known |
| P0-002 | Architecture/GPT | 001 | Next/TS scaffold, Zod schema, Vitest/Playwright scripts | CI install/build/test pass |
| P0-003 | Verification/Qwen | 002 | safe vulnerable/fixed refund fixtures, seeded barrier | UNIT-01..06 reproducible |
| P0-004 | API/GPT+DeepSeek | 003 | POST lab API, validation, provenance evidence | INT-01..02 pass |
| P0-005 | UI/Gemini | 004 | P0 routes, lab evidence UI, mobile/a11y | E2E-01..06 pass |
| P0-006 | GitHub/GPT | 002 | strict PR parser, GitHub REST bounded fetch, rate limits | INT-03..04, source SHA verified |
| P0-007 | AI/GPT+Claude | 006 | 3 real model stages, prompts, schemas, timeout | UNIT-07..08, INT-06..07 pass |
| P0-008 | QA/Security/Claude | 003–007 | threat audit, XSS, SSRF, prompt injection, keys | S-01..S-10 pass or explicit blocker |
| P0-009 | Release/integrator | 005–008 | Vercel preview PR, TestSprite triggered check | TS-01..04 real external evidence |
| P0-010 | Docs/demo/Integrator | 009 | README, video, submission message | actual link audit / ready for Discord |

## Work item template
Each item must have (1) before state, (2) changes by file, (3) tests written first when practical, (4) commands + exit code, (5) PR link/commit SHA, (6) source of acceptance, (7) blocker/rollback and proof. Missing proof => not done.

## Suggested work division for parallel agents
- Parallel safe: **003 verification helper** and **005 static design skeleton** once API schemas are frozen; **008 independent review** after PR exists. Use separate branches/ownership and merge through integrator.
- Not parallel safe: two agents editing `package.json`/shared schemas/routes simultaneously; two agents refactoring the same fixture.
- Strong recommendation: finish real lab before coding multiple AI integrations.

## Minimal scripted checks (after scripts exist)
```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright test
```
If any command is unavailable, implement script or explicitly document missing tool; never claim it ran.

## Integration checklist
Feature branch contains evidence, PR preview returns HTTP success, TestSprite is configured to wait for deployment-ready event, PR receives actual bot output, tests cover real lab and error paths, final README links PR. Only then merge/submit according to live rules.
