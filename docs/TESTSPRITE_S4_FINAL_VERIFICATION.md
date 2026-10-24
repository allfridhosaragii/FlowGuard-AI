# TestSprite Season 4 — Current and Historical Verification Evidence

**Updated 24 Oct 2026.** Results represent distinct executions; no combined fake success.

## Current real PR #14 execution

PR: https://github.com/allfridhosaragii/FlowGuard-AI/pull/14

- Head: `f812a92123880a251912e53ad03816e44e10c936`.
- Trigger: **real** Vercel `vercel[bot] PR comment`. Drafts ON, merge gate ON, target fixed to PR #14's public preview; second trigger Disabled.
- [TestSprite execution 7a1fa9d9](https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/7a1fa9d9-18a6-4b97-bf58-a922595d05cf): **96 Passed, 0 Failed, 1 Blocked / 97**.
- Blocked test: **Keyboard navigation and user feedback remain usable**. Its TestSprite run did not establish a successful natural Tab/focus/Enter path.
- GitHub status: **`TestSprite V3: failure`**, `96/97 passed · 1 blocked`.
- GitHub Ruleset 25749816: **Active**; `test-and-verify` and `TestSprite V3` are Required, no bypass list. PR #14 currently blocked, but also Draft.

**Do not claim a green merge or a non-Draft check-blocking test.**

## Independent keyboard browser evidence — different tool

[GitHub Actions run 40080749821](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821) tested natural Tab, Shift+Tab, Enter/Space on a local production build, the hosted PR preview, and production — **2 + 2 + 2 = 6/6 Passed**. [Source](https://github.com/allfridhosaragii/FlowGuard-AI/blob/audit/keyboard-natural-tab-20261024/tests/keyboard-natural-tab-audit.spec.ts). [Artifact](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821/artifacts/12555251397).

These tests intentionally avoid `locator.focus()` or scripted clicking, unlike the former partial keyboard test. They do **not** convert the vendor case from Blocked to Passed or certify every WCAG criterion.

## Historical TestSprite evidence

| Execution | Result | Qualifier |
|---|---|---|
| **Production on Oct 23 (21:33 WIB)** | **97/97 Passed** | Historical production-only run, not latest PR |
| **PR #13 preview** | **2 passed, 2 failed, 93 blocked / 97** | Protected Vercel preview required login |
| **PR #14 Send Test Event** | **95 passed, 2 failed, 0 blocked / 97** | Simulated event; vendor says GitHub status always success for connectivity |
| **PR #14 real Vercel event** | **96 passed, 0 failed, 1 blocked / 97** | Best genuine PR-scoped result, required check **failure** |
| **Local/browser GitHub CI** | **118 Vitest + 57 Playwright passed** | Separate suite; not TestSprite |

Vendor support email dated 24 Oct says simulated **Send Test Event** can overwrite a true failure status with `success`. Therefore never use it to prove a working merge gate.

## Meaning of the demo findings

The vulnerable refund fixture is a deliberately first-party synthetic demonstration of a race and is meant to return `VERIFIED_FAIL`. The corrected one is separately tested. SQL deadlock and healthy-stream fixtures are bounded synthetic models, **not** actual SQL databases or external message brokers. Third-party PR findings are POTENTIAL unless independently executed. Neural inference is off by default.

## Open item and next verification

One keyboard case is still **Blocked** in TestSprite; engineering/support follow-up remains outstanding. Keep the failed required GitHub status as truthful evidence and avoid repeat paid runs without a changed hypothesis or official instructions. Need exact TestSprite email/name, updated credit balance, actual pinned Discord channel, and explicit owner approval before any submission.

[Readiness](HACKATHON-SEASON-4-SUBMISSION.md) · [Evidence index](EVIDENCE-INDEX-S4-2026-10-24.md)
