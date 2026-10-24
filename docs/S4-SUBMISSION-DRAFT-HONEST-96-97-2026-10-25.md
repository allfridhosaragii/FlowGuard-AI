# TestSprite Hackathon Season 4 — FlowGuard AI submission draft (NOT SENT)

**Do not post without final owner approval and verification of organizer Discord pinned deadline/channel.**

## Draft message for Discord #hackathon-s4-submissions

**Project:** FlowGuard AI

**Repository:** https://github.com/allfridhosaragii/FlowGuard-AI

**TestSprite-integrated PR:** https://github.com/allfridhosaragii/FlowGuard-AI/pull/14

**Public live production:** https://flowguard-ai-smoky.vercel.app/

**Patched PR preview:** https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app/

**TestSprite account:** Allfridho Saragi — pedoprimasaragi@gmail.com

**What we built:** FlowGuard AI turns business rules into invariants, flags potential code risks, and plans verification. Its controlled Verification Lab supplies synthetic executions with carefully separated POTENTIAL, VERIFIED_PASS, VERIFIED_FAIL and INCONCLUSIVE evidence. The live production configuration uses deterministic heuristics unless neural inference is explicitly configured.

**Automated testing and merge gate:** The GitHub App triggers TestSprite V3 for PR previews. Branch protection requires `test-and-verify` and `TestSprite V3`; the current failure cannot be bypassed or misrepresented. The genuine patched PR run produced **96 Passed, 0 Failed and 1 Blocked of 97**:
https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/a32422c2-c648-4d62-b46a-275c68405396

The single blocked item is a keyboard navigation and user feedback case. We fixed a reproducible keyboard focus-loss bug and verified 21/21 accessibility tests across Chromium, Firefox and WebKit on the same publicly reachable PR preview:
https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40112116640

CI code regression: 118/118 Vitest and 64/64 Playwright passed:
https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40111999133

We have requested vendor diagnosis of the one blocked generated case and will preserve accurate official results rather than simulate a green check.

**Demo video:** None provided (optional).

## Final pre-post conditions

- Confirm actual organizer Discord submission channel, extended deadline, and whether 96/97 (1 Blocked) is considered eligible.
- Confirm public production / preview are accessible right before submission.
- Ensure README covers app, live URL and TestSprite suite.
- Clearly disclose currently failing TestSprite required check; do not call it green.
- Production dependency advisory scan currently fails due to high Zod advisory; do not assert a clean production dependency audit.
- Avoid merge into main, switching PR out of Draft, re-running paid suite, or posting to Discord without explicit owner consent.

**Status:** Draft only. This file is kept on a separate audit branch, not PR #14 or main.
