# FlowGuard AI — Extreme Bug Hunt Evidence & Residual Risks

**Date:** 22 October 2026 (WIB)  
**Branch:** audit/extreme-bughunt-20261022  
**Pull request:** https://github.com/allfridhosaragii/FlowGuard-AI/pull/6  
**Production baseline remains on main:** a6b5b993367ed6f7d49ed82903ac8e24e58d34e6  
**Scope:** Isolated synthetic fixtures and API route tests. No production load tests or unauthorized external testing.

## Red-to-green test evidence

| Step | Evidence | Result |
|---|---|---|
| Prove concurrency regressions existed | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39691712489 | 3 deliberately failing regressions; original 78 tests passing |
| Verify first fixes | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39693948160 | 94 Vitest + 43 Playwright passing |
| Prove missing body limits and malformed JSON errors | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39694549598 | 4 deliberately failing regressions; 94 earlier tests passing |
| Verify second fixes | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39694684135 | 98 Vitest + 43 Playwright passing |
| Audit dependencies and static security | https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39694684122 | Jobs successful; see limitations below |

## Confirmed findings and branch-only repairs

| Case | Severity in synthetic app | Before | Fix |
|---|---|---|---|
| XBUG-01 | High | Two different keys committed two concurrent refunds exceeding available balance | Shared synchronous balance reservations |
| XBUG-02 | Medium | An in-flight key reused with a different amount inherited successful refund response | Conflict rejected for in-flight amount mismatches |
| XBUG-03 | Medium | Same idempotency key reused for a different payment returned duplicate success | Cross-payment key conflicts rejected |
| XBUG-04/11 | Medium | User-controlled text inserted unsafely in generated executable JavaScript tests | Quote values with JSON.stringify |
| XBUG-05 | Medium | filePaths list had no length cap | Limit to 30 bounded strings |
| XBUG-06/07 | Medium | Planner could misrepresent heuristic fallback as real neural inference | Correct execution provenance labels |
| XBUG-08 | Medium | No committed effects could yield VERIFIED_PASS | Return INCONCLUSIVE when observedEffects is zero |
| XBUG-09 | Medium | Domain accepted negative, zero, fractional or NaN amounts | Positive safe-integer validation |
| XBUG-10 | Low | Requested multiple iterations were silently ignored | Explicitly reject unsupported repetitions |
| XBUG-12/13 | Medium | HTTP 500 responses could expose internal exception details | Generic public error messages |
| XBUG-14/15 | Medium | Oversized JSON request bodies were accepted | Enforce 64 KiB and 16 KiB streaming byte caps respectively; respond HTTP 413 |
| XBUG-16 | Low | Malformed JSON returned HTTP 500 | Return HTTP 400 INVALID_JSON |

The severity levels describe the synthetic demo application, not financial payment processing or external PR verification.

## Dependency and CodeQL results

- On the audited branch, **npm audit --omit=dev --audit-level=high** reports **0 known vulnerabilities in production dependencies**.
- The npm install log still reports **12 vulnerabilities in the full dependency tree**: 3 moderate, 7 high, and 2 critical. The development-side advisories remain to be individually reviewed and addressed. A clean production-only audit does not mean all dependencies are clean.
- The JavaScript/TypeScript CodeQL security-extended workflow completed successfully. This does **not** by itself prove zero CodeQL alerts; inspect the Code Scanning alerts to establish that separately.
- TypeScript, Next.js build, Vitest, and Playwright passed. ESLint had 0 errors and 24 warnings.

## Open issues and limitations

1. **Public API abuse and model costs (OWASP API4):** No distributed rate limit or global per-user quota is provided by this code. If paid LLM credentials are enabled, unauthenticated repeated analyses could raise cost or strain availability. Configure hosting-platform abuse protection and provider quotas; a JavaScript in-memory counter does not provide global serverless protection.
2. **Development dependencies:** Triage all 12 advisories before claiming a vulnerability-free dependency graph.
3. **Synthetic-only refund verification:** The in-memory fixture is not a durable, multi-instance real-money ledger. Results do not establish the safety of arbitrary external GitHub pull requests.
4. **TestSprite V3:** External runner continues to report a blocked 390x844 viewport test in previous reports. Independent Playwright tests do not turn that blocked provider check into a pass.
5. **GitHub controls:** Review branch protections and required checks for main; automation success alone does not prevent unreviewed direct pushes.
6. **Audit scope:** Static analysis, dependency checks, regression tests, and non-invasive browser testing cannot certify that all security vulnerabilities are absent.

OWASP reference: https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/

**Merge policy:** Keep PR #6 in draft until the user authorizes integration. Review changes and preserve green checks; leave production unchanged in the meantime.
