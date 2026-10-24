# FlowGuard AI — Candidate Discord Submission (UNSENT)

**WARNING: Do not post yet.** The current genuine PR #14 result is **96/97 with 1 Blocked**, and the PR is Draft. Contest instructions say checks should pass. It would be inaccurate to claim a green PR or 97/97 TestSprite PR pass. The official pinned Discord instructions and account identity are still unconfirmed.

**Candidate destination:** `#hackathon-s4-submissions` per participant-supplied newer organizer screenshot. The public TestSprite webpage still lists `#hackathon-submissions`. Confirm actual channel in Discord.

## Ready-to-edit draft (English)

**FlowGuard AI — Don't just review code. Prove it works. 🛡️**

FlowGuard AI is an evidence-first behavioral risk detection and verification workbench. It turns business rules into invariants, analyzes GitHub PR/code changes for potential risks, proposes executable checks, and demonstrates bounded concurrency verification in an isolated first-party lab.

Our demo contrasts a deliberately vulnerable **synthetic** refund scenario with a corrected idempotent implementation. Findings about external repositories are **POTENTIAL** until executed; the public app transparently falls back to deterministic heuristics with neural inference disabled by default.

**GitHub repository:** https://github.com/allfridhosaragii/FlowGuard-AI

**PR carrying TestSprite check:** https://github.com/allfridhosaragii/FlowGuard-AI/pull/14

**Public live app:** https://flowguard-ai-smoky.vercel.app/

**TestSprite account display name:** **[OWNER TO CONFIRM]**

**TestSprite account email:** **[OWNER TO CONFIRM; DO NOT GUESS FROM GITHUB/GMAIL]**

**Optional video:** **[ONLY ADD IF REAL RECORDING HAS BEEN UPLOADED]**

**Verification evidence (as of 24 Oct):** CI 118/118 Vitest + 57/57 Playwright. One genuine Vercel PR event automatically ran 97 TestSprite cases: **96 passed, 0 failed, 1 blocked**; GitHub accurately posted a failing Required status under active branch protection. Independent natural-keyboard Playwright verification passed 6/6 on local, PR preview and production. The unresolved keyboard vendor test remains **Blocked** and is not reported as passed.

Thank you to TestSprite and the Season 4 community for supporting automated, evidence-backed developer tooling!

## MUST CHECK BEFORE SENDING

- [ ] Recheck official organizer-pinned channel and deadline extension.
- [ ] Verify TestSprite account display name and login email.
- [ ] Confirm the **final** PR link, commit SHA, public site and exact current TestSprite test totals.
- [ ] Confirm whether a failed required check/Blocked test is acceptable or resolve it through official TestSprite Support. **Do not silently remove the test or spoof green status.**
- [ ] Confirm any optional video URL points to a **real public recording**.
- [ ] Confirm intended license; do not advertise MIT when there is no LICENSE.
- [ ] Obtain the owner's explicit final approval for exactly what will be posted.
- [ ] Only then post once in Discord. This document has never been submitted.

[Readiness audit](HACKATHON-SEASON-4-SUBMISSION.md)
