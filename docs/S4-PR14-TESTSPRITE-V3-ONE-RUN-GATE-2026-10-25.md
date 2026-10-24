# PR #14 patched preview — authorized TestSprite V3 one-run evidence gate

Date: 2026-10-25 (WIB).
Pull request: https://github.com/allfridhosaragii/FlowGuard-AI/pull/14
Last validated patched code SHA: `77fb02dd55eeb52b304dfbe8b227fceaba356e40`.
Preview alias: https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app

## Independent prerelease proofs

- PR #14 preview anonymous GET /, /analyze, /lab, /about and /api/v1/health passed; see https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40112116640.
- PR #14 hosted Chromium, Firefox and WebKit keyboard UX-002 suite passed 21/21 at the same preview URL.
- PR #14 full regression: Vitest 118/118 and Chromium Playwright 64/64; see https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40111999133.
- Neither the above checks nor this documentation update constitute official TestSprite results.

## Approved official verification

- Project owner approved **one genuine** TestSprite V3 execution after confirming PR URL, balance and trigger controls.
- In owner-provided screenshots, the primary `vercel[bot]` PR-comment trigger is Active, the alternative Vercel-commit-status trigger is Disabled, and the activity list shows no new execution after activation.
- Primary target URL pattern matches the PR #14 preview alias exactly. Draft PR testing and merge gate were enabled in last confirmed configuration.
- User-reported balance prior to the run: 412 credits. Published TestSprite FE rerun rate is 0.5 credits per case, implying a 48.5-credit base estimate for 97 frontend cases, not a billing cap.
- This single documentation-only commit is used to request one normal Vercel preview deployment event, rather than `Send Test Event`, CLI or manual tests.
- Do not generate a second trigger, rerun, change merge permissions, merge to main, or send Discord submission without separate owner approval.

## Result (pending)

No TestSprite 97/97 claim is made. Record the actual vendor execution URL, commit SHA, count of Passed/Failed/Blocked, GitHub status context, and credit consumption after a genuine official run.

The separate production dependency advisory concerning Zod is still unresolved in this patch and should not be misrepresented as a passing security audit.
