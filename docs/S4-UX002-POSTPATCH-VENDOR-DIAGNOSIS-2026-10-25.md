# TestSprite Season 4 UX-002: post-patch vendor execution evidence

Date: 25 Oct 2026 WIB. This is an evidence-only report stored on an **isolated audit branch**. Do not merge or use it to trigger another TestSprite execution.

## Exact official PR run
- Public PR: https://github.com/allfridhosaragii/FlowGuard-AI/pull/14
- Current verified PR head: `e4f6ee90c8daabeab236b54b2371409edbeba08c`
- Underlying keyboard fix committed in ancestor `77fb02dd55eeb52b304dfbe8b227fceaba356e40`
- Vercel preview tested: https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app/
- Official V3 execution: https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/a32422c2-c648-4d62-b46a-275c68405396
- Exact blocked test: https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/a32422c2-c648-4d62-b46a-275c68405396/test/8cdcab33-a925-447b-8298-e1165062c3b8
- Outcome: **96 passed, 0 failed, 1 blocked (97 cases)**. Real GitHub required check `TestSprite V3` is **failure**. The check MUST stay failing unless genuine vendor evidence changes it.
- Blocked test name: `Keyboard navigation and user feedback remain usable`.
- The public bot comment describes a keyboard focus-traversal limitation. It does **not** identify a precise failing assertion or prove a new app defect.

## Independent browser evidence on the exact patched PR preview
- https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40112116640 — hosted Vercel preview was anonymously reachable on /, /analyze, /lab, /about, /api/v1/health; **21/21 passed**: seven keyboard tests in each of Chromium, Firefox and WebKit.
- https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40111999133 — **118/118 Vitest, 64/64 Chromium Playwright**, TypeScript, ESLint and production build successful.
- Prior RED->GREEN focus-loss bug fixed with focus-preserving `aria-disabled`, reentrancy guards and live status announcements in Analyze, Lab and scenario panel.
- The vendor case remains Blocked after this patch. Browser and TestSprite results are independent; do not equate them.

## Identified accessibility improvement that has NOT been attributed to vendor Blocked
- Source `src/app/analyze/page.tsx`: two `role=tab` buttons with `aria-selected`, but without a tablist container, associated tabpanels/aria-controls, or a roving-arrow keyboard pattern. Existing UX002-FULL local test specifically Tabs through both buttons.
- This is a legitimate follow-up accessibility audit candidate, but changing it now without knowing TestSprite's exact blocked step risks altering expected natural Tab order and another vendor rerun.
- Do NOT make speculative app changes, weaken/drop UX002 acceptance, or claim this is the cause.

## Awaiting vendor-specific evidence
A reply was sent in the existing TestSprite support thread on 25 Oct (WIB) with the new execution, exact test link, hosted three-browser proof and requests for:
1. The step number/action/locator/assertion/DOM focused element and timeout/error at block.
2. Runner/tool limitation versus product bug classification.
3. Smallest supported test/runner correction that preserves all keyboard assertions.
4. A one-case no-additional-full-suite diagnosis/replay option.
5. Organizer-approved submission eligibility if vendor-side Blocked persists.

## Go/no-go and competition constraints
- **NO-GO for a claimed green PR:** TestSprite V3 is genuinely failure, and GitHub Ruleset requires TestSprite V3 plus test-and-verify.
- **YES to honest documentation of current evidence:** 96/97 and full independent keyboard browser proof.
- Official TestSprite Hackathon S4 page requires a public repo, README, public URL, PR with real TestSprite check, account name/email and Discord submission. It explicitly recommends green checks; no official exemption for a Blocked case has been established.
- Website has an older date/channel; a newer organizer Discord screenshot in the handoff records the extension to 26 Oct 2026 23:59 PT and #hackathon-s4-submissions. Final organizer pinned message still needs confirmation.
- Separate existing `Production dependency advisory audit` fails with Zod high advisory; this is NOT a TestSprite keyboard root cause. Prior Zod 4.6.7 migration was tested isolated but is not in this PR.
- PR #14 remains Draft; main has not changed; do not merge or submit without owner's explicit approval.
- Do not use `Send Test Event`, bypass required checks, turn on concurrent CLI and GitHub App triggers, or spend TestSprite credits without separate bounded permission.
