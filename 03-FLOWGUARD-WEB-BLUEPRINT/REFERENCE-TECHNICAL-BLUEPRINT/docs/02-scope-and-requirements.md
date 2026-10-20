# 02 — Scope, Epics, Functional Requirements and Acceptance Criteria

## Definition of scope levels

- **P0 / ship:** fully implemented, unit/integration/E2E tested for an end-to-end public demo, no fake data presented as production outcome.
- **P1 / stretch:** add only after P0 and TestSprite GitHub PR checks are green.
- **P2 / later:** documents roadmap, not built and not advertised as released.

## P0 feature contract

| ID | Feature | Precise behavior | Acceptance criterion | Proof/test |
|---|---|---|---|---|
| FR-01 | Public homepage | Explain niche and supported boundaries | CTA to Live Demo, no fake metrics, mobile viewport 320px | UI-01, UI-02 |
| FR-02 | Manual Lab | Choose vulnerable/fixed fixture; enter retry count and idempotency key | Distinct inputs change replay parameters and evidence | LAB-01, LAB-02 |
| FR-03 | Replay and verdict | Execute allowlisted fixture only | Two independent attempts produce duplicate side effects in vulnerable fixture; one in fixed | VER-01, VER-02 |
| FR-04 | Requirements | Accept human-written business invariant, constrain length | Required; parsed rule is visible/adjustable; parsing errors explicit | AG-01, API-01 |
| FR-05 | Three agent stages | Extract invariant, hypothesize risk, plan verification | Each stage has schema-validated state; model output never alone marks verified | AG-02, AG-03 |
| FR-06 | Public PR review | Validate GitHub URL, fetch bound PR metadata and capped patch | Show actual repo, PR, commit SHA and source lines; mark all external PR findings potential | GH-01, GH-02 |
| FR-07 | Evidence report | Show hypothesis vs observed test verdict distinctly | Evidence includes fixture/harness version, inputs, observations, clock and test run id | VER-03, UI-06 |
| FR-08 | Robust errors | Display invalid input, GitHub not found/rate-limit, AI failure, runner failure | No crash, no invented success, actionable message | API-02, AG-04 |
| FR-09 | Security | Server-only LLM secret, GitHub allowlist, limits, rate limiting | Scan bundle excludes secret, reject unsupported URL and user-executable code | SEC-01..SEC-06 |
| FR-10 | TestSprite-ready | Actual preview deployment PR and passing portal suite | PR auto-comment/check from TestSprite; running suite, not a screenshot simulation | CI-01..CI-04 |
| FR-11 | Source honesty | Product copy matches shipped implementation | README/site avoid inaccurate 'zero-day', '<120ms', '99.8%' | DOC-01 |
| FR-12 | Responsive accessibility | Keyboard-accessible mobile-first app with status announcements | Minimum 320, 375, 768, 1024, 1440 px; usable focus and contrast | UI-03..UI-05 |

## P1 stretch (only if P0 all passes)

- One-click public PR analysis deep link and copy/share evidence.
- Agent model selection through server environment.
- Per-run saved history in Postgres with 24-hour expiry.
- Export machine-readable JSON evidence, sanitized markdown and downloadable .json.
- Second first-party business invariant case: refund only if settled.

## P2 roadmap (explicitly not a submission promise)

- GitHub App for FlowGuard itself (app webhook PR event, installations, private repos) — distinct from TestSprite's required GitHub App.
- Sandboxed isolated execution for arbitrary user repositories (containers, ephemeral network isolation, quotas), per-PR test code generation, multi-language support.
- Secure business rule registry, collaboration, teams, RBAC, subscription billing, SOC2 readiness, distributed transaction verification.
- Automated patch suggestions requiring explicit approval, replay on real preview deployment, event ordering/webhook safety.

## Scenario specification P0

**INV-REFUND-001:** For `(paymentId, idempotencyKey)` in a synthetic ledger, at most one refund-side effect is permitted, regardless of 1..5 concurrent requests or retries; requests with the same key and conflicting parameters must be rejected or flagged, not silently create extra refunds. No real payment provider calls.

**Controlled fixtures:** `vulnerable` (read-before-write race with synchronization barrier) and `fixed` (synchronous claim of idempotency key before async work). Runner resets isolated state before each trial; executes identical inputs and reports counts. This is a proof about fixtures, not about an unrelated external PR.

## Bounded input rules

- Business rule: 10–2,000 characters; reject empty or oversized.
- Public PR URL: `https://github.com/{owner}/{repo}/pull/{number}` only. No arbitrary scheme, port, credentials, or redirects to non-GitHub origin.
- PR patch: cap 20 changed textual files, 100 KB aggregate diff and 3,000 changed lines; return `UNSUPPORTED_SCOPE` when exceeded, no silent truncation.
- Lab: concurrency count integer 1..5, runs 1..20, safe idempotency key 1..80 chars, payload_mode `same_amount|conflicting_amounts`, amount_minor_units 1..1,000,000; per-IP throttling.
- LLM output: Zod schema parse, one retry on invalid response, explicit failure when still invalid.

## Acceptance vocabulary

`PASS`: a supported executed test meets the invariant; `FAIL`: actual executed observation violates it; `POTENTIAL`: an agent suspects a risk, test has not demonstrated it; `INCONCLUSIVE`: runner/data insufficient; `ERROR`: infrastructure/agent failure (never show as PASS). See 16-vocabulary-and-status.md.

## MVP release gate

All FR-01..FR-12 trace to tests; zero failures among P0 release-blocking tests; PR check from TestSprite successful on live preview; no critical security issue; user can reproduce one vulnerable FAIL and fixed PASS. If any gate fails, reduce P1 or disable broken functionality rather than hiding it.
