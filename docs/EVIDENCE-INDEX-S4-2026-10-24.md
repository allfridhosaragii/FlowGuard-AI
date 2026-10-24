# FlowGuard AI — Season 4 Evidence Index (24 October 2026)

All links below are evidence by scope. **Do not equate production 97/97 with the later PR #14 outcome.**

| Evidence | Direct link | Proves |
|---|---|---|
| Public production | https://flowguard-ai-smoky.vercel.app/ | Canonical app; known anonymous access, hosted keyboard test at /analyze |
| Public repository | https://github.com/allfridhosaragii/FlowGuard-AI | Source history and README |
| PR #14 | https://github.com/allfridhosaragii/FlowGuard-AI/pull/14 | Draft, Vercel bot, TestSprite bot, failed Required check |
| Controlled genuine trigger commit | https://github.com/allfridhosaragii/FlowGuard-AI/commit/f812a92123880a251912e53ad03816e44e10c936 | New Vercel comment → new TestSprite event |
| PR preview | https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app/ | Preview URL for PR #14 |
| **Current genuine TestSprite suite** | https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/7a1fa9d9-18a6-4b97-bf58-a922595d05cf | **96 passed, 1 blocked / 97**, GitHub status failure |
| Historical simulated TestSprite event | https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/788f945e-18ff-4788-afc1-e7efdd81f683 | **95 passed, 2 failed**; synthetic Send Test Event may wrongly post status success |
| PR #14 core CI | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459361 | **118 Vitest + 57 Playwright**, build, TypeScript, lint |
| Real keyboard proof | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821 | **6/6** browser checks local+preview+production |
| Actual-Tab keyboard test source | https://github.com/allfridhosaragii/FlowGuard-AI/blob/audit/keyboard-natural-tab-20261024/tests/keyboard-natural-tab-audit.spec.ts | No forced focus/click/fill |
| Keyboard trace/screenshot artifact | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821/artifacts/12555251397 | 7-day retention, preserve before expiry if needed |
| Main Ruleset | https://github.com/allfridhosaragii/FlowGuard-AI/rules/25749816 | Active protection, failed TestSprite Required check |
| Production dependency/CodeQL audit | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39952366285 | Production-only audit 0; full audit 12 advisories; CodeQL completed |
| Semgrep/Trivy/ZAP toolbox audit | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459319 | Semgrep 18; ZAP WARN CSP; Trivy nonblocking |
| Historical PR #13 | https://github.com/allfridhosaragii/FlowGuard-AI/pull/13 | Protected-preview access failure history |
| Official Season 4 rules | https://www.testsprite.com/hackathon-s4 | Rubric 40/40/20, required PR, live site and TestSprite name/email; stale posted deadline/channel |
| Latest readiness | HACKATHON-SEASON-4-SUBMISSION.md | Current verified status and open blockers |
| TestSprite ledger | TESTSPRITE_S4_FINAL_VERIFICATION.md | Historic-vs-current reconciliation |
| Security/quality audit | SECURITY-QUALITY-FINAL-AUDIT-2026-10-24.md | Honest security findings and risk disposition |
| Demo runbook | DEMO-RUNBOOK-S4-2026-10-24.md | Genuine demo flow (video not recorded) |
| Discord draft | DISCORD-SUBMISSION-DRAFT-S4-2026-10-24.md | **NOT SENT**, account placeholders |

**Outstanding owner inputs:** account TestSprite display name/email, pinned Discord channel, updated credit balance, acceptance strategy for Blocked test, owner license decision, and explicit submission authorization. **There is no evidence the final submission has already been posted.**
