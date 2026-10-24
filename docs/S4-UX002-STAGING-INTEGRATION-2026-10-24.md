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