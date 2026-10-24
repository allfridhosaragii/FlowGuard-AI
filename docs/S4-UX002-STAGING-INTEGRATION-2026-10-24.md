# Season 4 — UX-002 keyboard integration candidate

> Staging only. No PR created, no paid TestSprite triggered, no merge and no production deployment authorized.

## Candidate lineage
- Base is the genuine PR #14 head f812a92123880a251912e53ad03816e44e10c936 (documentation only).
- The patch is taken unchanged from reviewed fix branch b96e50a85d108fd46be648c661d937f4d1461e0d.
- Three browser HTTPS strategy reproduces proven run https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40095744067 (21/21 passed).
- The staged changes include three application components, seven UX-002 tests, and dedicated test-only infrastructure. Separate Zod 4 patch is deliberately excluded.

## Required decision gates
- [ ] Full TypeScript, lint, Vitest, production build and Chromium Playwright pass on this exact staging head.
- [ ] Seven unchanged UX-002 tests each pass on Chromium, Firefox and WebKit under local HTTPS with original CSP.
- [ ] Before any real TestSprite rerun, verify a new live Vercel preview is actually built from this patched head.
- [ ] Existing TestSprite Vercel App PR-comment trigger uses a fixed docs-15dd3a target; a new PR may charge credits against the wrong preview. Verify and correct target only with approval.
- [ ] Confirm TestSprite balance, possible duplicate triggers and a one-time paid-run plan.
- [ ] Use a genuine PR event and inspect exact commit/run; never press Send Test Event for merge-gate evidence.
- [ ] Keep main branch ruleset active, PR #14 Draft, and no fake green checks.
- [ ] Do not mix external Zod 4 dependency changes into this surgical keyboard verification.

## Interpretations
Passing 182/182 local regressions and 21/21 three-browser tests does not convert the existing TestSprite result from 96 Passed / 1 Blocked into 97/97.
Official TestSprite project eligibility, correct Discord posting and explicit final submission authorization remain separate requirements.

## Verified staging integration outcome — 24 October 2026

- Integrated branch head at verification: 29674e9c6b61c4a9e534f543bfccf1cb588219af.
- Candidate CI: https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40099379177 — SUCCESS in both jobs, including 118/118 Vitest, 64/64 Chromium Playwright, TypeScript, ESLint (zero errors, 24 warnings) and Next.js production build.
- Candidate Chromium/Firefox/WebKit over local HTTPS: **21/21 passed**, while keeping the original production CSP intact.
- REAL Vercel branch alias, extracted from Vercel Preview Comments: https://flowguard-ai-git-stag-3631de-pedoprimasaragi-gmailcoms-projects.vercel.app
- Anonymous live-URL check: https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40099379227 — FAILED AS DESIGNED. HTTP eventually appeared to be 200, but followed redirects to https://vercel.com/login?..., and the response was not the FlowGuard AI app. The staging preview is **protected**.
- **Stop gate:** do not launch or schedule TestSprite against this protected staging branch. A successful Vercel deployment status is not proof that a bot can access its app.

## Minimal next Vercel action (requires project-account access)

1. In Vercel open FlowGuard AI > Deployment Protection > Deployment Protection Exceptions.
2. Add **only** the exact branch preview domain flowguard-ai-git-stag-3631de-pedoprimasaragi-gmailcoms-projects.vercel.app as a narrow exception, if the owner approves public staging access. Avoid disabling Vercel Authentication for all previews.
3. Repeat the same anonymous GET health/homepage test until it yields the real app, not vercel.com/login.
4. BEFORE creating/updating a PR, reconcile the active TestSprite Vercel bot trigger's previously pinned docs-15dd3a URL with the **actual patched PR URL**. Otherwise a real test may expend credits on an old branch.
5. Confirm current TestSprite credits and whether the one-run budget is approved, then run a single genuine event (never Send Test Event). Preserve the failing check if the vendor runner still reports Blocked.

Vercel official explanation: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/deployment-protection-exceptions

This integration candidate is **not** submission-ready. The current genuine TestSprite PR #14 status remains 96 Passed, 1 Blocked.
