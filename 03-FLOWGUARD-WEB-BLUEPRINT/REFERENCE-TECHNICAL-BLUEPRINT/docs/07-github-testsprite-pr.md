# 07 — GitHub, Vercel Preview Deployments, TestSprite 3.0

## Separate integrations: do not confuse them

1. **FlowGuard's GitHub PR reader (product feature)**: read-only access to public PR metadata/changed files, initially via REST API. This does **not** mean FlowGuard automatically runs on every repository PR, nor does it install a GitHub App.
2. **TestSprite's GitHub App (Season 4 requirement)**: installed by the user in TestSprite workspace and linked to FlowGuard repository; listens for a successful PR preview deployment and runs TestSprite portal test cases. It creates actual GitHub PR comments/checks.

## Requirements from official docs

TestSprite GitHub integration requires: a repository already producing deployments, a TestSprite project with tests already planned/generated, and permission to install its GitHub App. On PR, the trigger must be an event after deployment is ready; TestSprite resolves the **preview URL**, executes portal tests and reports results in a PR comment/check. Source: https://docs.testsprite.com/web-portal/integrations/github-integration

Vercel GitHub integration makes a preview deployment for a PR automatically when connected to the repository. Source: https://vercel.com/docs/git/vercel-for-github

## Exact setup plan

1. Connect `allfridhosaragii/FlowGuard-AI` to Vercel project; confirm `main` production URL and a new branch PR's **own working preview URL**. Inspect deploy bot PR comment.
2. TestSprite current project (already explored `flowguard-ai-smoky.vercel.app`) must have generated/executed tests of the *current app*, not just legacy simulator-only 23 planned cases. Update PRD, re-explore and curate tests if architecture changes significantly.
3. In TestSprite Workspace Settings -> Connections -> Integrations -> GitHub -> Connect/Install & Authorize. Select **Only select repositories** -> `allfridhosaragii/FlowGuard-AI`.
4. In TestSprite project -> `GitHub Action` -> `Add Trigger` -> Pull Request; paste an **existing PR with ready preview** -> Detect Events.
5. Choose the event signaling **preview ready**, not build start. Configure URL pattern per detected Vercel actual preview domain; **never guess the pattern** without seeing the PR bot URL. Send Test Event. Confirm TestSprite comment/check shows on exact PR and correct SHA/URL.
6. Create Active trigger; enable `Block PR until tests pass` if supported/permissions allow; verify one failed test blocks merge and fix+recheck passes. If enforcement unavailable, disclose and at minimum supply PR check history.
7. Any subsequent PR pushes should rerun automatically without clicking 'Run' manually.

## Required PR evidence flow

A real PR must contain material code change. Start with deliberately failing functionality **only in a branch/preview**; test catches failure. Make corrective commit on the same PR; confirm the automatically triggered rerun passed. Do not claim fail->green if a fixed scenario was merely toggled in the simulator without code changes. Never fabricate TestSprite run logs.

**Evidence checklist per PR**: PR link; feature branch -> main; actual commit history; Vercel preview URL; TestSprite bot comment/check timestamp; suite name and coverage; evidence of fail and subsequent green; explanation of root cause and code fix. Do not merge before the useful proof is captured (merging not required for evidence per se).

## Independent product tests vs S4 check

FlowGuard verification lab's internal `VERIFIED_FAIL` / `VERIFIED_PASS` findings are domain-specific product results. The TestSprite PR check is an **external QA signal on FlowGuard app quality**. They must appear as separate objects in UI/documentation. Even a green TestSprite check does not prove FlowGuard analyzed every third-party PR correctly.

## Common integration errors and decision tree

- No `Detect Events` results -> create real PR branch and inspect Vercel deployment event/bot comment; reattempt after Ready.
- URL 401/auth wall -> turn off preview protection for authorized test URL or configure supported test credentials; never make production secrets public.
- Trigger fires at build start -> select completion event.
- Trigger points to production URL -> use actual per-PR preview pattern/URL for code-under-test.
- TestSprite suite absent -> generate and run tests from portal first.
- 404 GitHub App install -> confirm account/repo installation rights and selected repo scope.
- Credits exhausted -> prioritize critical cases; request hackathon credit boost through organizer's published form.

## Submission requirements

By **Oct 22 11:59 PM PT** (Oct 23 13:59 WIB), public GitHub repository README including app/live URL/suite; at least one PR with TestSprite report; live public Vercel URL; TestSprite account name/email matching signup; post links in Discord `#hackathon-submissions` (and follow any newly announced organizer form). Optional video. Sources: https://www.testsprite.com/hackathon-s4 and official Discord rules furnished by organizer.
