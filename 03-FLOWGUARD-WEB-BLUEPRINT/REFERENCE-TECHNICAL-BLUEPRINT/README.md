# FlowGuard AI — Final Product & Engineering Blueprint

**Version:** 1.0.0 (planning baseline)  
**Date:** 20 October 2026 (Asia/Jakarta)  
**Product:** FlowGuard AI — AI-Powered Bug Hunting & Risk Detection Platform  
**Repository:** https://github.com/allfridhosaragii/FlowGuard-AI  
**Deployed simulator:** https://flowguard-ai-smoky.vercel.app/

> **Important:** This is a complete *design specification*, not evidence that a functioning AI product has been implemented, tested or audited. '100% complete' refers to documented decisions/acceptance criteria within the explicitly defined MVP. Production reliability, security, test coverage, performance and competition outcomes remain unverified until executed.

## North star

**Don't just review code. Prove the business rule.**

FlowGuard translates business invariants and code changes into candidate risks, bounded tests, and linked execution evidence. An AI-generated opinion remains `POTENTIAL` until evidence produced by a trusted executor establishes a verdict.

## Decisions frozen for the hackathon

- **Target:** global TypeScript web developers / small teams; English UI; no auth required for public demo.
- **Narrow wedge:** one payment/refund idempotency invariant; duplicate requests under retry/concurrency. Add other domains **after** reliable MVP.
- **Primary flows:** (A) PR Risk Review (read-only public PR + business rule; hypotheses), (B) Verification Lab (safe first-party vulnerable/fixed fixture; runtime proof).
- **3 agents:** Requirement Analyst -> Risk Hunter -> Verification Planner; JSON schemas, limits, citations to actual source lines, bounded retry.
- **Deterministic executor:** only allowlisted tests in first-party fixture. Absolutely no arbitrary user-uploaded code/script execution in Vercel.
- **Stack:** Next.js App Router, React, TypeScript, Tailwind, Zod, provider-agnostic server-side LLM adapter, Vitest, Playwright, Neon Postgres/Drizzle, Vercel; GitHub public REST read-only.
- **External QA:** TestSprite 3.0 web portal suite + its GitHub App on a PR preview deployment; green PR check is required submission proof.
- **No synthetic claims presented as real telemetry:** remove 99.8% catch rate, <120ms inference, zero-day monitoring and 'native TestSprite harness' claims until measured/implemented.
- **Product quality:** responsive accessible UI, clear states and errors, no fake loading/logs and no fake verified findings.
- **Shipping constraint:** deadline Oct 22, 2026 11:59 PM Pacific = Oct 23 13:59 WIB, subject to organizer updates. Freeze on Oct 22.

## Reading order

1. [Product and research](docs/01-product-and-research.md)
2. [Scope, requirements and acceptance criteria](docs/02-scope-and-requirements.md)
3. [User experience, accessibility and copy](docs/03-user-experience.md)
4. [System architecture and decisions](docs/04-system-architecture.md)
5. [Agent contracts and orchestration](docs/05-agent-orchestration.md)
6. [Verification engine and fixtures](docs/06-verification-engine.md)
7. [API specification](specs/openapi.yaml)
8. [Database schema](specs/schema.sql)
9. [GitHub and TestSprite integration](docs/07-github-testsprite-pr.md)
10. [Quality strategy and test cases](docs/08-qa-and-traceability.md)
11. [Threat model and privacy](docs/09-security-and-privacy.md)
12. [Performance, resilience and costs](docs/10-operations-and-costs.md)
13. [Sprint and critical path](docs/11-sprint-and-scope-cuts.md)
14. [Demo and submission](docs/12-demo-and-submission.md)
15. [Development agent execution instructions](docs/13-agent-build-contract.md)
16. [Risk/decision register and spec sign-off](docs/14-risks-and-signoff.md)
17. [Evidence and status audit](docs/15-current-state-audit.md)
18. [Product vocabulary, status and claims](docs/16-vocabulary-and-status.md)
19. [Market validation and longer-term roadmap](docs/17-validation-and-post-hackathon.md)

## Main product scenario

Rule: **For a single payment intent, retries using the same idempotency key must yield at most one refund-side effect.**

A controlled vulnerable function incorrectly records multiple refunds when concurrent requests pass a stale state check. A fixed function atomically claims the key before side effects. Same harness and same deterministic inputs demonstrate FAIL -> PASS with evidence. This fixture proves the fixture behavior, *not arbitrary external GitHub PR behavior*.

## Key acceptance conditions

- AC-01: An input change changes actual computation/analysis, not a preset label.
- AC-02: No AI output alone can set a `VERIFIED_*` status.
- AC-03: Vulnerable fixture fails its invariant and fixed fixture passes with the same suite.
- AC-04: Runtime result records build/hash, case ID, attempt count, observed side-effect count, timestamps and evidence references.
- AC-05: Public PR diff processing yields `POTENTIAL` with code references; no claim of executing external code.
- AC-06: Invalid/abusive input, secrets, rate limits and provider outages fail safely.
- AC-07: TestSprite PR integration fires on ready preview deployment, reports on PR and passes after fix.
- AC-08: Live Vercel, README, public repo and submission evidence are ready before deadline.

## External sources (official)

- TestSprite S4 rules: https://www.testsprite.com/hackathon-s4
- TestSprite GitHub integration: https://docs.testsprite.com/web-portal/integrations/github-integration
- Vercel Git deployments: https://vercel.com/docs/git/vercel-for-github
- GitHub untrusted PR code risk: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
- GitHub PR files endpoint: https://docs.github.com/en/rest/pulls/pulls

## Design completeness vs. implementation progress

**Design checklist:** every core decision has an owner/default, input, output, failure mode, acceptance criterion, verification method and deferral policy. This can be treated as a 100% *decision coverage target* after review of the included specs. **Implementation:** not complete; the current GitHub site remains a four-preset browser simulation. No inference, real multi-agent runtime or verified PR automation has been observed at the time of this document.
