# FlowGuard AI — Season 4 Go/No-Go and TestSprite Support Follow-up

> **Snapshot:** 24 October 2026 (WIB). **UNSENT ENTRY.** This is a decision checklist, not permission to change merge protections, run paid tests or post an entry.

## What official rules actually require

Source: https://www.testsprite.com/hackathon-s4 (public website checked 24 October). **Project Track**, not the separate CLI Improvement Bonus.

- Public repo + README describing app, live URL, what the test suite covers.
- Public live deployment (judges must be able to open it).
- A GitHub PR with an automatic TestSprite bot comment/status check; website explicitly says **tests should pass**. The strongest demonstration is fail → fix → real green check.
- Final **Discord** post containing PR URL, live app URL, and the **exact TestSprite account name + email**.
- Video **optional** (encouraged, not essential to satisfy the basic submission requirements).
- Judging: **40 project quality / 40 self-running tests and merge gate / 20 innovation**.
- Public page retains the older **Oct 22 11:59 PM PT** deadline and **#hackathon-submissions** channel. A newer participant-supplied organizer Discord screenshot announces **Oct 26 11:59 PM Pacific (Oct 27 13:59 WIB)** and **#hackathon-s4-submissions**. The screenshot's private Discord announcement cannot independently be re-fetched through current available tools. **The live pinned Discord message must be confirmed before submission.** Do not assert these differing public/private dates are already reconciled.

## Completed, independently verified

| Item | Observed proof |
|---|---|
| Real TestSprite PR event | https://github.com/allfridhosaragii/FlowGuard-AI/pull/14 |
| Actual current vendor outcome | **96 passed, 0 failed, 1 blocked / 97; TestSprite V3 GitHub status failure**, not green |
| Active required check | https://github.com/allfridhosaragii/FlowGuard-AI/rules/25749816; **TestSprite V3 and test-and-verify required** |
| Main branch | Protected; unchanged at `b283df23db8fd988732bfa98730b582194da1bbc` |
| PR #14 | Open Draft, head `f812a92123880a251912e53ad03816e44e10c936`, not merged |
| CI | 118/118 Vitest + 57/57 Playwright, TypeScript/lint/build success at https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459361 |
| Browser keyboard | 6/6, real key presses across local production build, hosted PR preview and production: https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821 |
| Public hosted smoke | 10/10 GET checks across both hosts: https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40089236066 |
| Documentation and demo kit | Prepared on isolated `docs/s4-final-quality-audit-20261024` branch; not merged into main or PR #14 |

## Support escalation completed 24 October

A **new reply in the existing TestSprite Support email thread** was sent from the project account to the already-used support address `contact@testsprite.com`; subject: *Re: FlowGuard AI — TestSprite V3 keyboard test blocked and incorrect PR status check*. Gmail sent message ID: `1a16db940810e537`. The support thread already existed before the follow-up.

The message supplied:
- The **genuine** run URL and PR head, 96 passed / 1 blocked, and correctly failing required GitHub check.
- Independent 6/6 Chromium proof and test source; all three environments, with natural Tab/Shift+Tab/Enter/Space (no scripted focus).
- A request for a **reproducible runner-vs-app root-cause finding**, the smallest supported configuration change preserving keyboard assertions, and **no unapproved credit-consuming full rerun**.
- An explicit eligibility question: if vendor-side blocked outcome cannot be fixed by deadline, can the Project Track submission still be judged with the honest blocked check plus independent evidence?
- A request for an engineering/organizer answer rather than a speculative app code change.

**Email successfully sent, but no specific vendor reply to this new evidence has yet been verified** as part of this audit. Do not claim Holly has replied or approved an exception.

## Go/No-Go matrix

| Condition | Required state before claiming submission-ready | At snapshot |
|---|---|---|
| Repo + production + README | Public, reachable and relevant | **YES** |
| Genuine PR TestSprite check | Prefer **97/97, 0 blocked and actual success**, or organizer's explicit written acceptance of unresolved blocked case | **NO / waiting vendor** |
| GitHub gate | Active and reporting true status on exact head; no fake green | **YES (currently failure)** |
| Automation on future PRs | Reusable PR-relative preview target **verified**, not just fixed docs-15dd3a for PR #14, if claiming all PRs automatically work | **NOT VERIFIED** |
| Final docs in intended branch | Accurate results on relevant submission branch; merge only by explicit decision respecting failed required gate | **ISOLATED; NOT MERGED** |
| Correct live pinned Discord channel | Confirmed organizer message in the actual Discord | **UNVERIFIED** |
| TestSprite account display name and email | Matched to account used for the TestSprite suite | **UNVERIFIED** |
| Credits for any vendor-requested rerun | Balance and exact scope confirmed, explicit owner authority | **NOT CONFIRMED** |
| Software license claims | No unsupported MIT/Apache claims without an actual LICENSE | **YES (no badge/claim)** |
| Optional video | Only link an actually captured/public video if available | **NO VIDEO — optional** |
| Final authorization | Owner has approved the exact Discord post, links, and remaining disclosures | **NOT GIVEN** |

**Operational decision:** Preserve PR #14 Draft, preserve its real failure, do not activate a second trigger, and do not rerun vendor tests without a vendor-supported reason plus authorized credit budget. A functioning 6/6 Playwright keyboard test is strong evidence, but not a TestSprite pass or WCAG certification.

**Do not submit simply to meet an assumed deadline if the actual Discord instructions or required identity remain unknown.** If the organizer confirms a valid submission route with an outstanding vendor limitation, present it honestly without mutating the real TestSprite result.

## Evidence navigation

- [Main readiness](HACKATHON-SEASON-4-SUBMISSION.md)
- [Latest TestSprite ledger](TESTSPRITE_S4_FINAL_VERIFICATION.md)
- [Security triage](SECURITY-QUALITY-FINAL-AUDIT-2026-10-24.md)
- [Four-minute demo runbook](DEMO-RUNBOOK-S4-2026-10-24.md)
- [Evidence index](EVIDENCE-INDEX-S4-2026-10-24.md)
- [Unsent Discord candidate](DISCORD-SUBMISSION-DRAFT-S4-2026-10-24.md)
