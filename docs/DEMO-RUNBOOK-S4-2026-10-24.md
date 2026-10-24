# FlowGuard AI — Honest 4-minute Season 4 Demo Runbook

> Prepared 24 October 2026. **This is a recording/narration plan, not an actual video.** The competition lists a video as optional. Record only actual live screens and do not simulate a successful TestSprite result.

| Time | Screen and steps | Suggested narration |
|---|---|---|
| **0:00–0:35** | [Homepage](https://flowguard-ai-smoky.vercel.app/) and application navigation | “FlowGuard AI helps developers test behavioral invariants instead of relying on static code inspection alone.” |
| **0:35–1:25** | [Verification Lab](https://flowguard-ai-smoky.vercel.app/lab); select deliberately vulnerable **first-party synthetic refund** with bounded concurrency and execute once | “This fixture contains an intentional concurrency race. Its VERIFIED_FAIL reproduces duplicate effects **only in our synthetic harness**, not a real payment service.” |
| **1:25–2:05** | Switch to the corrected synthetic refund fixture and run the same scenario | “The corrected fixture protects idempotency. VERIFIED_PASS is scoped to this executed model and cannot certify arbitrary systems.” |
| **2:05–2:55** | [PR Analysis](https://flowguard-ai-smoky.vercel.app/analyze); load a sample code snippet, display model provenance, requirements, POTENTIAL findings and verification plan | “Agent A extracts invariants, Agent B flags scoped possible risks, Agent C proposes tests. Our production deployment defaults to **deterministic heuristic fallback**, not a configured paid neural model.” |
| **2:55–3:35** | [PR #14](https://github.com/allfridhosaragii/FlowGuard-AI/pull/14), expand bot comment and Required status | “A genuine Vercel preview event automatically ran 97 TestSprite cases: 96 passed, one keyboard test Blocked, and the honest failing Required check is visible under an Active protection ruleset.” |
| **3:35–4:00** | [Independent keyboard proof](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821), then README | “Actual Tab/Enter Playwright checks passed 6/6 on local, preview and production, but that does not replace the Blocked vendor test. Evidence precedes verdicts.” |

## Before recording

- Use clean incognito/browser windows with only FlowGuard AI and evidence tabs. Hide private emails, account tokens, notifications, or unrelated open tabs.
- Open the canonical production site and check it works anonymously.
- Do not send genuine bank IDs, customer data, secret tokens, or external exploit payloads. Use **bundled synthetic fixtures** only.
- Do not activate paid LLM inference or spend TestSprite credits for recording.
- Do not manipulate GitHub required checks, TestSprite tests or PR status to look green.
- Any demo attempt that actually fails should be described accurately or replaced by a transparently labeled previously captured screenshot.

## Valid phrases and claims

- **Vulnerable refund**: an intentional synthetic test that should **fail** its invariant.
- **Corrected refund**: a separate guarded synthetic implementation with executed local verification.
- **SQL deadlock / stream audit**: synthetic allowlisted scenarios, not a real production SQL or message broker.
- **External GitHub PR**: analysis is **POTENTIAL** until verified through an appropriate harness.
- **Model**: deterministic heuristic under current default, never imply neural inference was used.
- **Tests**: historical production 97/97 on Oct 23; current real PR **96 passed, 1 blocked** on Oct 24; independent keyboard **6/6** separate.
- **Merge gate**: active required failure recorded and PR currently blocked; Draft itself is also a merge constraint.

## Video delivery status

- Script/sequence: **prepared**.
- Real 4-minute recording: **not captured**.
- Public upload link: **not available**.
- Demo video is **optional**; do not invent an upload URL in submission draft.

[Evidence Index](EVIDENCE-INDEX-S4-2026-10-24.md) · [Readiness](HACKATHON-SEASON-4-SUBMISSION.md)
