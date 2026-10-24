# FlowGuard AI — TestSprite Hackathon Season 4 | Pre-submission Evidence & Readiness

> **Document status:** Working audit draft, updated 24 October 2026. **NOT a submitted entry, approval, or proof of complete compliance.**
>
> **Evidence hierarchy:** Official rules and organizer announcements; GitHub commit/status/check artifacts; dated TestSprite reports; user-supplied dashboard screenshots. Where direct access or a fresh test is unavailable, the issue remains **unverified**.
>
> **Historical note:** The earlier version of this document contained old PR statuses, outdated test totals, and Devpost instructions. [View that historical snapshot at commit b283df23](https://github.com/allfridhosaragii/FlowGuard-AI/blob/b283df23db8fd988732bfa98730b582194da1bbc/docs/HACKATHON-SEASON-4-SUBMISSION.md). Do not use the historical snapshot as a current submission checklist.

## 1. Official Season 4 requirements and deadlines

- Organizer: TestSprite, Season 4 Project Track. [Official event page](https://www.testsprite.com/hackathon-s4).
- **Deadline extension announced by Holly McAninch in official Discord on 22 October 2026:** Monday **26 October 2026, 11:59 PM Pacific Time** (PDT), equivalent to **Tuesday 27 October 2026, 13:59 WIB**. This supersedes the website's earlier deadline of 22 October 23:59 PT. Screenshot of the organizer announcement is retained in the project handoff; it was not fetched directly from public Discord.
- Organizer's extension announcement states rules, judging criteria, and prizes remain the same.
- **Submission channel:** Discord `#hackathon-s4-submissions`. This is **not** a Devpost submission.
- Submission should include a GitHub PR link showing TestSprite automated feedback/status, a public accessible application URL, and the participant's TestSprite account identification (name/email). The participant must verify the exact live channel instructions and account details before posting.
- Published judging criteria: **Project Quality 40 / Tests That Run Themselves 40 / Innovation 20**. PR-triggered TestSprite testing and effective merge blocking are central to the automation component.
- **Do not submit without an explicit final approval from the project owner and completed pre-submission audit.** A report saying "ready" is not evidence of rule compliance.

## 2. Canonical project references

| Evidence | Reference | Status/scope |
| --- | --- | --- |
| Repository | [allfridhosaragii/FlowGuard-AI](https://github.com/allfridhosaragii/FlowGuard-AI) | Public when checked |
| Baseline `main` | [b283df23db8fd988732bfa98730b582194da1bbc](https://github.com/allfridhosaragii/FlowGuard-AI/commit/b283df23db8fd988732bfa98730b582194da1bbc) | 23 Oct; verify live HEAD before finalization |
| Intended public production | [flowguard-ai-smoky.vercel.app](https://flowguard-ai-smoky.vercel.app/) | Direct anonymous access must be rechecked |
| Production TestSprite evidence | [Final verification document](TESTSPRITE_S4_FINAL_VERIFICATION.md) | Historical 97/97; production only |
| Latest verified main CI | [GitHub Actions run 39985661853](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39985661853) | Successful on baseline `main` |
| Historical PR automation | [PR #1](https://github.com/allfridhosaragii/FlowGuard-AI/pull/1) | **Merged**; TestSprite 22 passed, 0 failed, 1 blocked |
| Most recent audited PR | [PR #13](https://github.com/allfridhosaragii/FlowGuard-AI/pull/13) | **Merged**; preview tests did NOT all pass |
| Isolated bug-hunt audit | [PR #6](https://github.com/allfridhosaragii/FlowGuard-AI/pull/6) | Open draft; do **not** merge automatically |
| GitHub ruleset | [Rule 25749816](https://github.com/allfridhosaragii/FlowGuard-AI/rules/25749816) | Configured but **DISABLED** |
| TestSprite project | [TestSprite V3](https://www.testsprite.com/dashboard-v3) | Private account; current trigger and credit state require authenticated verification |

## 3. Product overview — truthful scope

FlowGuard AI uses **Next.js 15 / React 19 / TypeScript**, with three cooperating analysis stages and an opt-in verification lab.

1. **Requirement Analyst (Agent A)**: extracts scoped invariant candidates from a business rule and contextual code.
2. **Risk Hunter (Agent B)**: examines supplied snippets or selected public GitHub PR diff patches. Findings on external code are **POTENTIAL**, not proof of exploitable vulnerability or executed external code.
3. **Verification Planner (Agent C)**: proposes test plans/assertions linked to supported fixtures.
4. **Controlled Verification Lab**: runs concurrent asynchronous requests on allowlisted **first-party synthetic refund fixtures**. It does not execute arbitrary external PR code. Invariant `INV-REFUND-001` concerns duplicate refund side effects.
5. **SQL deadlock / healthy stream scenarios**: deterministic **synthetic in-memory fixtures**, not production database or external stream verification.
6. **Neural model inference**: requires `FLOWGUARD_ENABLE_NEURAL=true` and a valid provider key. Otherwise the system uses a labelled heuristic fallback. Production environment flags have not been independently inspected.

The risk-analysis API constrains request body sizes, PR file selection and diff length; these do **not** mean every threat, race, or arbitrary PR has been verified.

## 4. Test evidence — separate environments, no combined pass claims

| Test source | Date/environment | Verified outcome | Meaning |
| --- | --- | --- | --- |
| **Vitest** | GitHub CI on baseline `main`, 23 Oct 2026 | **118/118 passed** | Repository unit/integration suite |
| **Playwright** | Same GitHub CI | **57/57 passed** | Local CI browser E2E, accessibility and responsive checks |
| **TypeScript / Next build** | Same CI | Success | Compile/build gates; does not certify production availability |
| **ESLint** | Same CI | **0 errors; 24 warnings** | Nonzero warnings remain |
| **TestSprite production** | 23 Oct 2026, reported 21:33 WIB | **97 passed, 0 failed, 0 blocked** | Historical full production regression; **not** a PR preview result |
| **TestSprite PR #1** | 21 Oct 2026, automated PR feedback | **22 passed, 0 failed, 1 blocked (23 total)** | PR-level automation executed; check state `failure` |
| **TestSprite PR #13** | 23 Oct 2026, protected Vercel preview | **2 passed, 2 failed, 93 blocked (97 total)** | Unsuccessful PR preview coverage due predominantly to Vercel login |

- [Production verification evidence](TESTSPRITE_S4_FINAL_VERIFICATION.md)
- [Main CI run](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39985661853)
- [PR #1 TestSprite comment](https://github.com/allfridhosaragii/FlowGuard-AI/pull/1#issuecomment-6306495822)
- [PR #13 TestSprite comment](https://github.com/allfridhosaragii/FlowGuard-AI/pull/13#issuecomment-6368289766)
- [PR #13 unsuccessful preview execution](https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/498782fb-772f-4665-a983-6ba0ccbc11c3)

**Viewport note:** The earlier diagnosis that the PR #1 blocked mobile case was definitively caused by an immutable cloud-runner viewport was not substantiated. Subsequent TestSprite support correspondence stated that the viewport had not been configured at the project or test-case level. Playwright mobile coverage is independent of this TestSprite case.

## 5. TestSprite status inconsistency and the merge-gate gap

At commit `78e2e444fab76359629749bc7267c1bb98eee2d6` (PR #13), GitHub's TestSprite V3 commit-status history includes:

- Earlier execution: `failure`, description **76/97 passed · 21 failed**.
- Later execution: `success`, description **2/97 passed · 2 failed · 93 blocked**, linking to the unsuccessful execution above.

**This is an observed mismatch between the final GitHub status and its own test-result description.** The underlying reason has not been established; do not assert it is definitely a vendor bug or a local misconfiguration.

As of the authenticated TestSprite screenshots inspected on 24 October:

- Trigger 1: Vercel bot PR-comment event, target URL fixed to `feat-1b3908` preview, **Disabled**, merge-gate option enabled in its stored configuration.
- Trigger 2: Vercel commit-status event, dynamic `{branch-slug}` preview URL, **Disabled**, merge-gate option not enabled.
- The Activity tab shows PR #13 events as **Tests started**; this is not a completed passing result.
- A separate GitHub branch ruleset targets the default branch and requires `test-and-verify` and `TestSprite V3`, with no bypass list. **Enforcement is disabled**, so it does not currently block merges.
- Activating these independently without repairing status consistency, preview accessibility, and credit capacity could create misleading passes or an unusable merge path.

An escalation to TestSprite support and the organizer has been sent by the participant concerning the anomalous status and delayed participant plan/credits. **Do not run another credit-consuming suite without approval and known capacity.**

## 6. Security and dependency audit boundaries

- GitHub Actions include TypeScript, lint, build, Vitest and Playwright on `ci.yml`; the CI workflow **does not itself execute remote TestSprite 3.0**.
- CodeQL and production-only npm audit are present in a separate security workflow.
- Semgrep and ZAP steps are configured with `continue-on-error: true`; Trivy uses `exit-code: '0'`. Therefore passing workflow status does **not** mean zero scanner findings.
- Archived evidence includes a post-fix CodeQL SARIF run with zero entries and a Trivy snapshot with zero reported findings **for their respective runs/scopes**. Full development-dependency audits previously reported advisories, even where the production-only high/critical audit passed.
- The Content-Security-Policy currently permits `'unsafe-inline'` for scripts/styles, a documented hardening limitation.
- No application-level rate limiting was established in the audited API route source; any Vercel-side WAF controls remain unverified.
- GitHub PR fetch in `src/lib/github/pr-reader.ts` lacks an explicit request timeout in the audited source.
- A license badge was previously present in README while `LICENSE` was missing from the repository. **Do not infer or grant a license without the repository owner's decision.**

## 7. Pre-submission gates (ALL must be assessed)

- [ ] Validate the exact pinned organizer instructions in `#hackathon-s4-submissions`, including any change after the deadline-extension announcement.
- [ ] Establish whether a submission was already made, and whether post-submission changes are prohibited. **Never submit automatically.**
- [ ] Confirm an anonymous visitor can open the canonical production deployment and use key paths.
- [ ] Verify TestSprite participant plan and credit availability from the actual dashboard; distinguish requested upgrade from granted upgrade.
- [ ] Resolve or obtain official guidance on TestSprite status `success` with failed/blocked tests.
- [ ] Configure a single correct PR-event/preview strategy without accidentally testing a fixed old branch or duplicating paid executions.
- [ ] Show a real PR check failure prevents merging with the **enforced** GitHub ruleset, then show the corrected passing check allows merging, only with permission and available credits.
- [ ] Review unresolved dependency, scanner, API abuse, CSP, and documentation issues; make evidence-backed decisions.
- [ ] Choose a PR with accurate and clearly displayed TestSprite results and confirm the final public live URL.
- [ ] Confirm the participant's intended TestSprite account name/email and exact Discord submission format. Never invent identifiers.
- [ ] Obtain explicit owner sign-off. Only then prepare a final submission action.

**Readiness is NOT 100% merely because production TestSprite had 97/97 passing tests.**

## 8. Process safety

- Do not alter `main`, merge PRs, enable TestSprite triggers, spend credits, change Vercel protection, activate GitHub rulesets, or post the Discord submission as a side effect of editing these docs.
- Documentation edits should first be isolated in a separate branch. Creation of a branch/commit may itself trigger Vercel deployment depending on configured hooks; review activity afterwards.
- If the project has already been officially submitted and subsequent changes are prohibited, freeze all changes and use read-only inspection.

## 9. Controlled PR #14 live-trigger verification

> **Status at commit time:** Verification in progress; **not** a passing TestSprite result, a verified GitHub merge block, or submission approval.

- Intent: use this documentation-only commit on draft PR #14 to generate a **real Vercel preview event** for the enabled TestSprite `vercel[bot] PR comment` trigger; do not use `Send Test Event`, which TestSprite Support confirmed can overwrite genuine failing statuses with `success`.
- Target: the existing public `docs-15dd3a` Vercel preview for this PR; `Run on drafts too` and TestSprite `Merge gate` were enabled by the owner. The separate older Vercel commit-status trigger remains disabled.
- Required evidence after the event: Vercel deployment readiness, an actual matching Vercel comment, an attributable PR-scoped TestSprite execution, and the resulting GitHub commit status. A GitHub ruleset set to `Disabled` **cannot** itself prove merge blocking.
- Do not infer pass/fail totals, credits consumed, or successful PR enforcement from trigger configuration alone. Do not merge or submit without explicit owner approval.
