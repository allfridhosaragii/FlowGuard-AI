# 12 — Demo Script, Judge Story, Submission and Proof

## Judge-facing proposition

**FlowGuard AI finds business-invariant risk hypotheses in code and shows real test evidence for supported, safe scenarios.** This is not a generic 'AI reviewed your code' app and not a claim to verify any arbitrary GitHub PR automatically.

## 2-minute demo (real footage only)

| Time | Scene | Visual proof | Voiceover intent |
|---|---|---|---|
| 00:00–00:15 | Hero / problem | Product in browser | 'AI-written code can look correct but break an important business rule.' |
| 00:15–00:35 | PR risk review | Public PR URL + invariant pasted; actual GitHub commit/path | 'We identify possible rule violations from source changes.' |
| 00:35–00:55 | Agent reasoning | Real 3-stage outputs with source refs and POTENTIAL label | 'Three agents extract rule, analyze risk, and plan a safe verification.' |
| 00:55–01:20 | Vulnerable lab | Run N=2 same-key requests -> actual two ledger effects, FAIL | 'The controlled vulnerable implementation produces a duplicate side effect.' |
| 01:20–01:35 | Fixed lab | Reuse same inputs -> one ledger effect, PASS | 'A fixed implementation enforces the rule.' |
| 01:35–01:55 | TestSprite PR | Actual GitHub PR, Vercel preview link, TestSprite comment/check, rerun | 'Every product PR is independently tested by TestSprite after deployment.' |
| 01:55–02:00 | Close | Landing/README and disclaimer | 'Don't just review code. Prove the business rule.' |

**No fabricated TestSprite check, model output, run log, performance or simulated PR status.** If a stage isn't implemented, remove it from the video and disclose in README.

## Submission bundle

- [ ] Public `https://github.com/allfridhosaragii/FlowGuard-AI` includes real source and README with live URL, features, how to run locally, limitation and suite coverage.
- [ ] Live `https://flowguard-ai-smoky.vercel.app/` responds to reviewers, no login needed for demo.
- [ ] TestSprite project has meaningful suite generated/running against current app.
- [ ] At least one PR has **actual TestSprite comment or status check** with results. Passing tests desirable/expected by organizers.
- [ ] PR preview URL is reachable and matches PR commit.
- [ ] CI/unit/E2E test evidence visible or linked.
- [ ] Demo video optional and available if filmed.
- [ ] Discord `#hackathon-submissions` post completed before Oct 22 23:59 PT with PR link, live URL, TestSprite account name/email, optional video.
- [ ] Follow organizer Discord updates for any extra submission form; no duplicated entries or account mismatch.

## Discord submission template (replace placeholders only after verifying)

```markdown
**FlowGuard AI — AI-Powered Bug Hunting & Risk Detection Platform**

**What it does:** Converts business rules and public PR changes into traceable risk hypotheses, with executed verification in an isolated first-party refund idempotency lab.

**Live app:** https://flowguard-ai-smoky.vercel.app/
**Repository:** https://github.com/allfridhosaragii/FlowGuard-AI
**PR with TestSprite check:** [INSERT REAL PR URL]
**TestSprite account name:** [EXACT ACCOUNT NAME]
**TestSprite account email:** [EXACT ACCOUNT EMAIL]
**Demo video:** [OPTIONAL REAL LINK]

**Testing summary:** [INSERT ACTUAL TESTSUITE COUNT, WHAT IS COVERED, PR FAIL->FIX->PASS IF EVIDENCE EXISTS]
**Limitations:** [DISCLOSE ANY FEATURES NOT SHIPPED]
```

## Post-submission sanity

Keep production and PR preview live during judging; do not silently change the product after submission. If organizer modifies rules, latest Discord material update takes precedence; note timestamps and update checklist.

## Source of official rules

https://www.testsprite.com/hackathon-s4 ; https://docs.testsprite.com/web-portal/integrations/github-integration
