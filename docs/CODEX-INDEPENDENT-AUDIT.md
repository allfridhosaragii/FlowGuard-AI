# Independent Codex audit — FlowGuard AI

Date: 21 October 2026 (Asia/Jakarta)

## Scope and repository state

- Audited [PR #1](https://github.com/allfridhosaragii/FlowGuard-AI/pull/1), `feat/testsprite-s4-hardening`, at `5b1773e24d2deba972c8555f16fa26f0ec2300fb`. `git ls-remote` and the public PR page both showed this head. The local audit branch is `codex/independent-audit`; no push, merge, deployment, or submission was performed.
- The current changes are local and uncommitted for review. Production may still use `main`; it was not used as evidence for the feature branch.
- Environment: Debian 13, Node 24.19.0, npm 11.9.0, Next.js 15.5.28, Playwright 1.64.1. Local browser tests used system Chromium 154 because the Playwright 156 download was blocked by the cloud network policy.

## Verified baseline before source edits

| Check | Result on PR head |
| --- | --- |
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Passed; 163 packages installed from lockfile |
| `npx tsc --noEmit` | Passed |
| `npm test` | 64 passed, 0 failed, 0 skipped |
| `npm run build` | Passed |
| `npx playwright test` | Could not launch: bundled Chromium executable absent; download returned HTTP 403 `Domain forbidden` from `cdn.playwright.dev` |
| Playwright with system Chromium override | 42 passed, 0 failed, 0 skipped |
| `npm run lint` | Exited 1 at interactive ESLint configuration prompt; ESLint and `eslint-config-next` were absent |

The override is in `playwright.audit.config.ts`. In this environment, run `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --config=playwright.audit.config.ts`. This exercises Chromium 154, while CI installs the Playwright-pinned browser. The override preserves the repository's normal Playwright configuration when the variable is absent.

The 42 browser tests covered desktop, 320/375/390-pixel mobile widths, tablet, touch navigation, analysis, lab interactions, keyboard controls, and overflow. Chromium device emulation does not establish physical iOS Safari behavior.

## TestSprite mobile block

**Root cause classification: TEST_RUNNER_LIMITATION (best supported explanation).** The public TestSprite comment on PR #1 for [execution 233c1570](https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/233c1570-a0cf-48cd-8e80-813b4f3ebef4) reports **22 passed, 0 failed, 1 blocked** and explicitly says the browser viewport could not be changed to the requested **390×844** size. Local browser tests could set that viewport and complete the corresponding primary flows. The app emitted a `width=device-width, initial-scale=1` viewport tag, and tested mobile widths did not overflow before or after results rendered. These observations support a TestSprite browser setup limitation for this run; they do not prove the app has no responsive bugs.

The TestSprite dashboard and browser runner were inaccessible from this cloud machine (proxy HTTP 403), so the runner configuration and exact Merge Gate policy could not be inspected. The repository document says the GitHub TestSprite check is unsuccessful despite zero failed assertions; that policy detail remains **unverified independently**. A blocked test is not a pass. Application code cannot set the viewport of TestSprite's external browser. Keep the case and its blocked result intact while TestSprite support investigates.

The public GitHub Actions [run 39470490717](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39470490717) identifies PR head `5b1773e` and displays overall **Success**. Individual job logs require sign-in, so their detailed counts were not independently read. The Vercel feature preview could not be tested from this environment because the proxy returned HTTP 403; no claim about its current response is made. Production was not used as a substitute for preview verification.

## Confirmed defects and repairs

| Severity | Defect reproduced before repair | Repair and after evidence |
| --- | --- | --- |
| High | The offline Risk Hunter scanned removed diff lines and JWT bypass text in deleted code, reporting a current `POTENTIAL` risk for code that the PR removed. Two new Vitest regressions failed before the fix. | `risk-agent.ts` now scans only added and context lines of the new side of each hunk and strips comments for both risk patterns. Both regressions pass. |
| High | Signals from unrelated changed files were combined into a false race finding, and a real finding in the second file was attributed to the first. Two new Vitest regressions failed before the fix. | Each file patch is scanned separately, and findings carry the correct path and distinct IDs. Both regressions pass. |
| Medium | Heuristic findings used fixed line references (`L18-L34` or `L10-L16`) regardless of the actual diff. Manual snippets were also assigned invented file lines. Two new Vitest regressions failed before the fix. | Diff findings now cite the actual new-file hunk range; manual snippets have no line reference. The UI omits empty line parentheses. Both regressions pass. |
| Medium | Clearing the code input while an analysis request was in flight allowed its old response to render a report for now-empty input. A delayed-response Playwright test failed before the fix. | Input, preset, and tab changes invalidate and abort the prior request and clear its result. The same browser regression now passes. |
| Low | A production browser requested `/favicon.ico` and logged a 404. | Added an App Router `icon.svg`; the rendered icon URL returned HTTP 200 and the repeated iPhone SE navigation/lab/analysis flow logged no browser errors. |

Risk Hunter remains a bounded regex heuristic, not proof of safety or a full source parser. Its findings remain `POTENTIAL`; `NO_RISK_FOUND` means no matching signal in analyzed evidence, not that code is free of defects. No API keys or external PR code were executed during this audit.

## ESLint resolution

The branch had a `next lint` script but no ESLint packages or configuration. Next.js therefore opened its configuration wizard, which is unsuitable for CI and cloud validation. The patch adds ESLint 9.39.5 and `eslint-config-next` 15.5.28, matching the installed Next.js 15.5.28 line, and supplies `eslint.config.mjs`. Because this Next.js release publishes legacy shareable presets, the flat configuration uses ESLint's `FlatCompat` adapter to load `next/core-web-vitals` and `next/typescript`. The script now runs `eslint .` directly.

The first noninteractive run exposed 26 `no-explicit-any` errors and 26 warnings. The errors were corrected with explicit request, response, event, and error-boundary types; the rule was not disabled. Final lint exits 0 with 0 errors and 25 pre-existing unused-symbol warnings. npm reports that ESLint 9.39.5 has left upstream support; ESLint 10 is outside `eslint-config-next` 15.5.28's declared peer range, so upgrading requires a coordinated Next.js toolchain update.

## Validation after repairs

- Final `npm test`: **70 passed, 0 failed, 0 skipped**. The six new unit regressions first failed on the corresponding old behavior and passed after the fix.
- Final `npm ci --cache /workspace/.npm-cache --no-audit --no-fund`: passed; 413 packages installed from the updated lockfile. The workspace cache was required because `/home/agent/.npm` is not writable in this cloud environment.
- Final `npx tsc --noEmit`: passed with exit 0.
- Final `npm run lint`: passed with exit 0, 0 errors, and 25 warnings.
- Final `npm run build`: passed with exit 0; 11 static/dynamic routes were generated, including `/icon.svg`.
- Full Playwright suite: **43 passed, 0 failed, 0 skipped** with the system Chromium override, including the new stale-response browser regression. A focused viewport test and the affected analysis browser tests also passed after the last changes.
- Direct production-browser smoke checks used official Playwright iPhone SE, iPhone 14, Pixel 7, iPad Mini, and desktop contexts. They completed navigation, lab, and analysis flows without horizontal overflow. The first run found only the favicon 404; its follow-up check found HTTP 200 for the icon and no console, page, or request errors on iPhone SE.
- `git diff --check` passed. `package.json`, `package-lock.json`, and `eslint.config.mjs` now contain the intentional lint setup.

Local traces and screenshots are generated under ignored `test-results/`. Browser logs are in `/tmp/flowguard-playwright-baseline.log` and `/tmp/flowguard-playwright-final-verified.log` in the current machine. These local artifacts and live server processes are not evidence that a newly published machine has run the same checks.

## Remaining limitations and decision

- The TestSprite mobile case is still blocked in the observed external run; its runner and Merge Gate behavior require a reply or rerun from TestSprite. The support discussion was not touched.
- The feature preview, TestSprite dashboard, GitHub API/check rollup, and physical iOS/WebKit testing were not reachable here. GitHub's public pages supplied only the PR comment and CI summary.
- ESLint 9.39.5 is the newest major accepted by `eslint-config-next` 15.5.28 but is reported by npm as outside upstream support. A future Next.js upgrade should move the lint stack to a supported ESLint major.
- Live neural inference was not configured or exercised. Model-supplied line references still require human review against the actual patch; the local regressions verify only the deterministic heuristic path.
- Existing project documentation claims zero mobile defects and a fixed desktop TestSprite runner more strongly than the directly observed evidence warrants. Those claims should be narrowed when the submission text is next edited.

**MERGE READINESS:** WAITING_FOR_TESTSPRITE. The local fixes are ready for code review, but they have not been pushed to PR #1, and the external blocked check has not been resolved or independently explained by runner configuration.

**SUBMISSION READINESS:** Not asserted. Review the patch and evidence first; confirm TestSprite's handling of blocked tests and the event's submission requirements before submitting.

**RECOMMENDED NEXT ACTION:** Review the local patch, then publish it through the project's normal review flow if accepted. Ask TestSprite support whether its browser can set 390×844 and how a blocked result affects its status check. Rerun the TestSprite case without weakening or deleting it.

## Decision summary

| Field | Decision |
| --- | --- |
| ROOT CAUSE | `TEST_RUNNER_LIMITATION` is the strongest explanation for the blocked mobile case; direct runner configuration remains unverified. |
| EVIDENCE | Public TestSprite PR comment, public CI run summary, local 390×844 Playwright execution, baseline failures, and regression traces. |
| REAL APPLICATION BUGS FOUND | Removed-code false positives, cross-file risk conflation/misattribution, invented line references, stale UI response, and missing icon. |
| FIXES IMPLEMENTED | Per-file new-side diff scan, real hunk references, request invalidation on input changes, and App Router icon. |
| TESTS BEFORE | 64 Vitest passed; 42 Playwright passed with system Chromium; type check and build passed; lint was unconfigured. |
| TESTS AFTER | 70 Vitest passed; 43 Playwright passed with system Chromium; type check, lint, and build passed. |
| FILES CHANGED | Application fixes, regression tests, lint configuration and typing cleanup, `playwright.audit.config.ts`, `src/app/icon.svg`, and review documentation. The exact inventory is in `docs/CODEX-PATCH-REVIEW.md`. |
| REMAINING BLOCKERS | TestSprite case blocked; runner/dashboard and feature preview inaccessible from this cloud network; local patch not published. |
| MERGE READINESS | `WAITING_FOR_TESTSPRITE` and code review. |
| SUBMISSION READINESS | Not asserted; requires project owner decision after evidence review. |
| RECOMMENDED NEXT ACTION | Review the patch and request a TestSprite runner/merge-gate clarification, then rerun the blocked case. |
