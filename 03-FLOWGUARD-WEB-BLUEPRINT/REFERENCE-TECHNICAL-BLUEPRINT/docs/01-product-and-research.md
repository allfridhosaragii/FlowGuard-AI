# 01 — Product Direction, Problem, Positioning, Validation

## Problem statement

AI-assisted coding and code review accelerate writing software, but reviewing syntactic correctness and existing tests does not guarantee that a changed business rule is respected, especially across retries and partial failures. A code reviewer may flag risky code yet provide no executable reproduction. FlowGuard makes the **invariant -> proposed counterexample -> proof** chain traceable.

## Primary user and job to be done

- **User:** TypeScript/Next.js developer or independent AI-assisted builder with a public GitHub repo.
- **Job:** *When a PR changes transactional code, help me discover likely business invariant violations and get a reproducible failure before merge, without giving an autonomous agent broad execution rights.*
- **Trigger:** manual pasted rule + public PR URL (P0), optionally repeated on GitHub PR by a future app (P2).
- **Outcome:** one actionable hypothesis with file/line evidence and a bounded test plan, or a clear report that no supported test could verify it.

## Differentiation

| Existing category | Common deliverable | FlowGuard's intended wedge |
|---|---|---|
| Linter/SAST | Static pattern finding | Business-rule-specific invariant hypothesis |
| AI PR review | Comments and suggestions | Structured invariant and runnable, bounded verification spec |
| TestSprite 3.0 | App UI/API test plan + PR test runs | Explain which *business invariant* motivates a targeted test; leave actual S4 app quality testing to TestSprite |
| Generic AI bug-fixer | AI-generated patch | Evidence-first report with human-controlled fix; auto-fix excluded from MVP |

**Important:** This is intended positioning; no comparative benchmark or market superiority has been demonstrated. Code review and testing products already overlap. Innovation must be shown in the live 2-minute end-to-end evidence chain.

## Non-goals and honest constraints

- No blanket 'find all bugs' or zero-day security claims.
- No automatic live monitoring or low-latency agent claims.
- No executing arbitrary remote PR code in production runtime.
- No payment or financial system integrations; refund fixture is synthetic.
- No production-grade distributed exactly-once guarantee claim: demo fixture is single-process and controlled.
- No guarantee that an LLM finds a vulnerability. Model may output zero findings or invalid output.

## Product narrative

A developer changes refund logic and writes 'A payment can only be refunded once.' FlowGuard collects a bounded PR diff, extracts the single-effect invariant, explores a duplicate-request edge case, and produces test parameters. In the first-party Verification Lab, it executes an equivalent approved scenario on a deterministic vulnerable/fixed fixture, showing actual outcomes. For arbitrary PRs, it reports *potential risk only*, because the test did not execute their code.

## Measure product usefulness

- **Actionable finding rate**: user labels useful/total valid risk findings (requires user testing; not currently measured).
- **Verification credibility**: zero `VERIFIED_*` findings without an immutable executor-run link (target 100%).
- **Successful core flow**: start -> output -> optional verify -> evidence reachable (target 100% on defined fixture matrix).
- **False-claim count**: unsupported telemetry or unverified vulnerability presented as fact (target zero).
- **Real adoption indicator after event**: repeated PR analyses per developer over 30 days (not measurable in hackathon without real users).

## User interviews to validate after shipping

Ask five developers for recent incidents involving retries, duplicate actions, unreliable review or hard-to-reproduce regressions; do not bias with the product name. Ask what failed, current tools, frequency, cost, how they confirmed the bug, and whether an external app would be used. Observe at least three unassisted 5-minute tasks on the beta. No invented quantitative market penetration.

## Evidence sources

Official: https://www.testsprite.com/hackathon-s4 ; https://docs.testsprite.com/web-portal/integrations/github-integration ; https://survey.stackoverflow.co/2025/ ; https://docs.github.com/en/rest/pulls/pulls
