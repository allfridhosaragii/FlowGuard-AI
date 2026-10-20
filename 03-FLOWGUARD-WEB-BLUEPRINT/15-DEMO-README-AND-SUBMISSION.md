# Demo Storyboard, Submission Requirements and Communications

## Two-minute demo script (film only after code exists)
- **00:00–00:15** problem: AI-generated code may pass existing tests but violate business rules on retry.
- **00:15–00:35** open `/lab`, set vulnerable refund fixture, concurrency 2 and key `retry-abc`; run actual API-backed check.
- **00:35–00:55** show `VERIFIED_FAIL`, effect count, test/fixture version, evidence.
- **00:55–01:10** switch to fixed, keep identical vector, run again -> `VERIFIED_PASS` for fixture.
- **01:10–01:35** open `/analyze`, enter actual public GitHub PR and explicit rule; show real source SHA and `POTENTIAL` hypothesis from 3-stage analysis.
- **01:35–02:00** open GitHub feature PR: Vercel preview, real TestSprite comment/check, test rerun after fix. End with source & known limitations.

If any demo step is not implemented, **remove it from video script** instead of compositing fake success.

## README required sections
1. What FlowGuard does in one truthful sentence.
2. Supported scope / unsupported claims (controlled refund fixture vs external public PR read-only).
3. Live production URL and exact repo URL.
4. Quick-start with pinned Node/npm, `npm ci`, run, test commands.
5. `.env.example` variable **names**; no secret values.
6. Architecture diagram, data-flow, trust statuses.
7. How to reproduce vulnerable FAIL vs fixed PASS including input vector.
8. TestSprite 3.0 portal suite coverage and actual PR link.
9. Security/privacy limitations, model dependencies, known issues.
10. Demo video link optional.

## Official submission checklist
- Repo public and existing source committed.
- README explains what app is, live URL, suite covers.
- TestSprite account email/name matches submission identity; never publish access tokens.
- TestSprite suite **exists AND has real runs**.
- TestSprite GitHub App actually attached to repo and PR check/comment visible.
- Live public production URL accessible + PR preview URL applicable.
- Post in Discord **`#hackathon-submissions`** before **Oct 22 23:59 PT / Oct 23 13:59 WIB** with (1) PR link with TestSprite check, (2) live URL, (3) TestSprite name/email; video optional.
- Do not confuse independent **CLI Improvement Bonus** with Project Track.

## Final manual release test (private browser)
Open URL, run both fixtures, intentionally send malformed input, show understandable UI error, open source link, display TestSprite PR check, confirm no authentication needed for demo. Verify server-side model key not sent to browser.

## Optional English Discord draft — fill real values ONLY
```text
FlowGuard AI — AI-Powered Bug Hunting & Risk Detection Platform
Live: <ACTUAL_PUBLIC_URL>
GitHub PR with TestSprite check: <ACTUAL_PR_URL>
TestSprite account: <ACCOUNT_NAME> (<ACCOUNT_EMAIL>)
Demo video (optional): <ACTUAL_URL>
Summary: A developer tool that converts explicit business invariants into potential PR risks and demonstrates reproducible failure/fix evidence using a safe first-party verification lab.
```
Replace placeholders manually after verifying live links. No fabricated check status.

Official https://www.testsprite.com/hackathon-s4
