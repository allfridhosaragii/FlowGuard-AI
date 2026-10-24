# FlowGuard AI — Security & Quality Final Triage (24 October 2026)

> **Evidence-backed evaluation, not a claim of full security certification.** Scope: public source, lockfile, GitHub Actions logs, published October security advisories, and previous hosted Chromium tests. No live penetration testing, remote malicious payloads, or source changes to production.

## 1. Snapshot and source of truth

- `main`: `b283df23db8fd988732bfa98730b582194da1bbc`; PR #14 docs branch: `f812a92123880a251912e53ad03816e44e10c936`. This audit-only documentation branch does not change these.
- [Hosted read-only smoke on Oct 24](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40089236066): **10/10 GET** targets passed (both production and PR #14 preview, routes /, /lab, /analyze, /about, health API). HTTP 200, health ok, and essential response headers were checked. This was neither an exploit test nor a load test.
- [CI PR #14 run 40078459361](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459361): TypeScript, lint, production build, **118/118 Vitest** and **57/57 Playwright** passed.
- [Security production advisory & CodeQL run 39952366285](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39952366285): production-only npm audit **0 vulnerabilities at run time**, and CodeQL analysis job successful. Workflow-job success **is not a guarantee of zero security alerts**.
- [Toolbox audit 40078459319](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459319): Semgrep **18 findings** from 35 files; passive ZAP **60 PASS, 1 WARN, 0 FAIL**; Trivy job reported success despite configured non-failing exit policy.

## 2. Runtime dependency vulnerability check

The repository's committed `package-lock.json` resolves **Next.js 15.5.28**, **React/React DOM 19.3.1**, **Sharp 0.35.5**. These versions meet the published October 2026 patched ranges for the major Next.js/React/Sharp advisories; no unrequested mass upgrade is justified on this evidence.

Sources: [Next.js 14 October security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [Cyber Security Agency of Singapore Oct 20](https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2026-148/), [NHS England Oct 19](https://digital.nhs.uk/cyber-alerts/2026/cc-4873).

A 23 Oct `npm audit --omit=dev --audit-level=high` recorded **0 production vulnerabilities**. That run's full `npm audit` listed **12 vulnerabilities/advisory chains: 3 moderate, 7 high, 2 critical** largely through development tooling such as Vitest/tinypool, Tailwind and ESLint dependencies. These advisory severities must be disclosed but **must not automatically be characterized as exploitable production RCE**. Status is time-bound; package advisories can change after Oct 23.

**Decision:** retain the patched runtime versions, avoid major toolchain migration days before deadline, and separately assess build/test dependency advisory paths with compatible upgrades and isolated CI tests after owner approval.

## 3. API/data isolation and cost controls

Verified in source:
- [Bounded JSON reader](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/lib/http/bounded-json.ts) counts streamed bytes, rejects oversized or malformed JSON.
- [Analysis API](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/app/api/v1/analyses/route.ts) applies 64 KiB request cap, Zod input validation, Business Rule 10–2000 chars, Code Snippet max 30,000 chars, and max 30 file paths. [GitHub PR reader](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/lib/github/pr-reader.ts) validates `github.com/owner/repo/pull/number` URL and limits assembled diff evidence to 200 KiB; GitHub access is read-only.
- [Refund lab API](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/app/api/v1/lab/verify/route.ts) limits JSON to 16 KiB, concurrency to 1–5, iterations to 1, allowlisted fixture names. This is first-party simulated execution, not real customer payment infrastructure.
- [Scenario API](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/app/api/v1/lab/scenario/route.ts) limits JSON to 4 KiB, uses strict allowlisted `sql-deadlock` / `healthy-stream` examples. It does not run user-provided SQL or launch external brokers.
- [AI Provider](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/src/lib/ai/provider.ts) requires **`FLOWGUARD_ENABLE_NEURAL=true` plus API key** to make actual model calls. It otherwise labels deterministic heuristic attribution honestly. When enabled, provider requests have 20-second abort timers.
- Routes return sanitized unexpected 500 errors rather than disclosing internal stack traces.

Remaining limitations:
- **No application-level per-IP/user rate limiter** was verified. Small per-request limits do not cap aggregate abuse, repeated external GitHub fetches or LLM spending if neural inference is later turned on. Do not assume Vercel WAF controls exist absent direct evidence.
- GitHub PR fetch paths were inspected without a short explicit request AbortSignal. External latency budget/concurrency could be improved.
- No authorized stress/load or malicious input testing was performed against the live app. Do not overclaim hardening completeness.

## 4. Browser CSP and scanner triage

- [Next.js headers](https://github.com/allfridhosaragii/FlowGuard-AI/blob/main/next.config.ts) configure CSP, no-sniff, anti-framing, HSTS, referrer-policy, COOP/COEP/CORP. Local Playwright `E2E-SEC-01` confirmed expected header values.
- **CSP** currently allows `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` to support Next.js hydration. Local ZAP passive baseline: one warning type (`CSP: script-src unsafe-inline`, 10 observations), 0 fail, 60 pass. This is a real acknowledged limitation, not a certificate of zero findings.
- **Semgrep** workflow scanned 35 tracked files with 244 rules and reported 18 findings tagged blocking, but its step has `continue-on-error: true`. Historical review associated many with mutable GitHub Action version references; individual rule IDs should be confirmed from uploaded JSON before treating all 18 as equivalent.
- **Trivy** workflow has `exit-code: '0'`, so the job passing proves scanner execution only. Its JSON is evidence, not a zero-findings certification until inspected.
- **ZAP** also uses `continue-on-error: true` and tested **isolated localhost**, not production.
- A successful **CodeQL** job is limited to that workflow's enabled scans/queries; do not assume a clean SARIF without reading it.

**Decision:** do not remove CSP inline allowances or switch scanners to hard-fail blindly just before judging; prepare an isolated change with hydration regression tests and severity triage. Keep the current required GitHub CI and TestSprite gate intact.

## 5. Usability, integrity and license

- [Natural keyboard audit 40080749821](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821): **6/6 passed**, using actual Tab/Shift+Tab/Enter/Space in local production build, hosted PR #14 preview, hosted production. This is **not** a TestSprite pass; PR #14 still has a Blocked keyboard test.
- The source-mode controls use `role="tab"` without the full WAI-ARIA tablist/arrow-key contract. Treat as semantic enhancement candidate; no evidence of a real Tab trap on audited path.
- Vulnerable synthetic refund intentionally reproduces an idempotency fault and is not a production implementation. Corrected fixture is separate. SQL/stream examples are bundled models; external PR findings are POTENTIAL until executed.
- **LICENSE missing.** PR #14 removed an unsupported MIT badge. Public GitHub visibility does **not** grant an MIT/Apache license; owner must decide.

## 6. Risk disposition

| Priority | Finding / action | Current status |
|---|---|---|
| **Contest blocker** | Real TestSprite PR suite **96/97, 1 Blocked** keyboard | Open; keep result truthful, obtain vendor guidance |
| **Contest quality** | README and latest evidence inaccurately said ruleset/triggers Disabled | Corrected in isolated docs branch, not yet merged |
| **P1** | App-level rate limiting / public API abuse budget | Not verified; must not enable paid neural model without protections |
| **P1** | Semgrep 18 and workflow mutable references | Triage detailed JSON; non-blocking scanner green != zero findings |
| **P1** | Temporary PR preview deployment protection exception | Remove only when PR testing no longer requires it |
| **P2** | CSP nonce-based mitigation | Separate tested hardening; hydration compatibility |
| **P2** | 12 full/dev advisory chains | Time-bound dependency review, not asserted production vulnerability |
| **P2** | License choice | Owner decision |
| **P2** | GitHub fetch request timeout/budget and aria-tab semantics | Separate regression-tested quality improvements |

**Result:** strong bounded demo architecture and passing functional CI, with documented residual findings. No certificate of absolute security or permission to merge is issued.
