# FlowGuard AI 🛡️

> **AI-Powered Bug Hunting & Behavioral Risk Detection Platform**  
> *Don't just review code. Prove it works.*  
> Built for **TestSprite Hackathon Season 4**.

[![Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?logo=vercel)](https://flowguard-ai-smoky.vercel.app/)
[![Build Status](https://img.shields.io/badge/Next.js-15%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-118%20Passing-success)](tests/)
[![Playwright E2E](https://img.shields.io/badge/Playwright-57%20Passing-success)](tests/e2e.spec.ts)

> **Season 4 current audit — 24 October 2026, NOT submitted.** PR #14 genuinely triggered TestSprite on its public preview: **96 passed, 0 failed, 1 blocked** (97 total), with the GitHub **TestSprite V3 status correctly at failure**. The [main protection ruleset](https://github.com/allfridhosaragii/FlowGuard-AI/rules/25749816) is **Active** and requires both TestSprite V3 and test-and-verify; PR #14 remains **Draft** and blocked. [CI on PR #14](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459361) passed **118 Vitest + 57 Playwright**, and [independent natural keyboard testing](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821) passed **6/6** across local build, PR preview and production. A historical **production** TestSprite run with 97/97 is **not** the current PR result. See [readiness](docs/HACKATHON-SEASON-4-SUBMISSION.md).

> **License status:** The previous README advertised MIT without a repository `LICENSE` file. Licensing remains undecided until the owner explicitly chooses and publishes it.

🔗 **Canonical public production URL**: [https://flowguard-ai-smoky.vercel.app/](https://flowguard-ai-smoky.vercel.app/)  
📦 **GitHub Repository**: [https://github.com/allfridhosaragii/FlowGuard-AI](https://github.com/allfridhosaragii/FlowGuard-AI)

**Audited PR #14 preview (not production):** [https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app/](https://flowguard-ai-git-docs-15dd3a-pedoprimasaragi-gmailcoms-projects.vercel.app/). The preview is supported by a temporary Vercel Deployment Protection exception; do not remove it while the PR needs testing.

---

## 🌟 The Problem FlowGuard AI Solves

Traditional pull request code reviews and static linters check syntax, types, and formatting, but miss critical runtime regressions:
- Duplicate refunds caused by concurrent payment retry races
- Missing idempotency keys on settlement requests
- Authorization logic bypasses
- Invalid state machine transitions under network jitter

FlowGuard AI bridges the gap between **code review** and **runtime verification**:
1. **Agent A (Requirement Analyst)**: Extracts formal mathematical invariants from human business rules with strict domain isolation and context cross-validation.
2. **Agent B (Risk Hunter)**: Analyzes PR diffs for race-condition windows and non-atomic state mutations (marked strictly as `POTENTIAL`).
3. **Agent C (Verification Planner)**: Synthesizes reproducible test specifications and **TestSprite 3.0** assertions targeting executable verification endpoints.
4. **Controlled Verification Lab**: Executes real concurrent asynchronous requests against target state machines, proving whether an invariant holds or fails.

---

## 🚀 Live Application Routes

| Route | Description |
|---|---|
| [`/`](https://flowguard-ai-smoky.vercel.app/) | **Landing Page** with core value proposition, static vs behavioral comparison, and live health status. |
| [`/lab`](https://flowguard-ai-smoky.vercel.app/lab) | **Controlled Verification Lab**: Toggle between vulnerable and fixed refund state machines, configure concurrency (1–5 concurrent asynchronous requests), run real parallel requests, and inspect execution evidence. |
| [`/analyze`](https://flowguard-ai-smoky.vercel.app/analyze) | **PR & Code Analysis Workspace**: Submit a public GitHub PR URL or code diff + business rule to run the 3-agent pipeline. |
| [`/about`](https://flowguard-ai-smoky.vercel.app/about) | **Architecture & Security**: Invariant formal definitions, state machine progression, and security isolation rules. |

---

## 🔌 API Endpoints (v1)

- `GET /api/v1/health`: System status, build version, and configured subsystem flags.
- `POST /api/v1/lab/verify`: Executes the controlled verification test harness with bounded concurrent asynchronous requests.
- `POST /api/v1/analyses`: Runs the 3-agent orchestration pipeline on GitHub PR diffs or code inputs.

---

## 🤖 AI Provider Architecture & Honesty Guarantees

FlowGuard AI supports:
1. **Google Gemini Native REST API**: Direct integration via `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (e.g. `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`).
2. **OpenAI-Compatible Providers**: `https://api.openai.com/v1/chat/completions` or any compatible gateway.
3. **Transparent Heuristic Fallback**: When no API key is provided, FlowGuard AI runs deterministic bounded heuristic pattern analysis. The UI explicitly discloses `isRealModel: false` and `heuristic-offline-analyzer (fallback)` — never claiming simulated or heuristic outputs are from a real neural model.

---

## 🧪 Automated Testing

FlowGuard AI maintains a dual test suite with Vitest and Playwright E2E:

```bash
# 1. Run the Vitest suite (118 passed in CI on 23 October 2026):
npm test

# 2. Run the Playwright suite (57 passed in CI on 23 October 2026):
npx playwright test

# 3. (Optional) Run Playwright directly against the live production deployment:
PLAYWRIGHT_BASE_URL=https://flowguard-ai-smoky.vercel.app npx playwright test

# 4. Run Vitest in watch mode:
npm run test:watch
```

### Historical Test Coverage Breakdown (21 October 2026)

> The per-file counts below document the historical snapshot and are **not** an exhaustive inventory of the newer 118 Vitest / 57 Playwright suite. The current verified aggregate is the [23 October CI run](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39985661853).
- **`tests/model-provenance.test.ts` (20 tests)**:
  - Agent A reports heuristic provenance when neural model returns invalid JSON or empty invariants.
  - Agent B reports heuristic provenance on malformed neural response and retains neural provenance on clean valid output.
  - Strips comments before regex scanning so comments alone cannot fabricate false race-condition findings.
  - AgentOrchestrator exposes per-agent heuristic vs neural provenance and truthful mixed-source model attribution.
- **`tests/verification.test.ts` (9 tests)**:
  - `V-01`: Vulnerable fixture under concurrency 2 produces duplicate refunds (`VERIFIED_FAIL`).
  - `V-02`: Fixed fixture under concurrency 2 commits exactly once (`VERIFIED_PASS`).
  - `V-03`: Single request concurrency 1 properly passes.
  - `V-04`: Fixed fixture under concurrency 5 maintains strict idempotency.
  - `V-05`: Conflicting idempotency key with differing amounts is rejected.
  - `V-06` & `V-07`: Input bounds and required parameters are strictly enforced.
  - `V-08`: Concurrency labeled accurately as `concurrent asynchronous requests`.
  - `V-09`: Test assertions target the real `/api/v1/lab/verify` endpoint.
- **`tests/agents.test.ts` (15 tests)**:
  - Formal invariant extraction, comment stripping in risk hunting, benign diffs returning clean empty findings (`NO_RISK_FOUND`), test planning with real endpoints, 6-stage orchestrator pipeline, and domain isolation hardening:
    - Arithmetic code with stale JWT rule extracts `INV-MATH-001` and never leaks `INV-AUTH-001`.
    - Arithmetic code with payment rule extracts `INV-MATH-001` and never leaks `INV-REFUND-001`.
    - Arithmetic code with matching arithmetic rule extracts `INV-MATH-001` with zero mismatch.
    - JWT code with matching JWT rule extracts `INV-AUTH-001` with zero mismatch.
    - End-to-end benign arithmetic analysis produces 0 findings, `NO_RISK_FOUND`, and no auth invariants even with conflicting rule.
    - End-to-end vulnerable JWT code produces `POTENTIAL` risk finding (`RISK-002`) with `INV-AUTH-001`.
- **`tests/api-integration.test.ts` (12 tests)**:
  - Integration tests for `GET /api/v1/health`, `POST /api/v1/lab/verify`, and `POST /api/v1/analyses` including boundary validation, whitespace rejection, honest GitHub fetch error propagation (preventing fake `NO_RISK_FOUND`), and partial analysis metadata.
- **`tests/github.test.ts` (22 tests)**:
  - Strict URL validation, unified diff parser, per-file patch filtering, regression test proving skipped files are excluded from Risk Hunter input, oversized diff handling preserving patch boundaries, single-file line truncation, pagination (>100 and >300 files), incomplete pagination API error handling, rate limits (403), 404s, binary file omission, renamed files, and honest error on 0 readable code patches.
- **`tests/e2e.spec.ts` (14 tests)**:
  - `E2E-01`: Landing page navigation and honest CTAs.
  - `E2E-02`: Controlled Lab reproducing race condition on vulnerable fixture.
  - `E2E-03`: Controlled Lab verifying idempotency on fixed fixture.
  - `E2E-04`: PR & Code Analysis workspace running multi-agent pipeline.
  - `E2E-05`: Architecture & Invariants page formal definitions.
  - `E2E-06 (LAB-008)`: Generated verification assertion copied to clipboard with honest feedback.
  - `E2E-07 (LAB-007)`: Empty idempotency key rejected with actionable validation and clears previous report.
  - `E2E-08 (ANA-004)`: Empty code snippet rejected before analysis without fake report.
  - `E2E-09 (UX-001)`: Mobile viewport (390x844) supports all primary user flows.
  - `E2E-10`: Context Isolation — JWT preset &rarr; Clear Code &rarr; arithmetic snippet &rarr; Launch Analysis does NOT leak `INV-AUTH-001`.
  - `E2E-11`: Clean Arithmetic preset loads consistent code & rule and verifies cleanly (`INV-MATH-001`).
  - `E2E-12`: Domain mismatch between code and custom rule displays visible notice without certifying mismatched rule.
  - `E2E-13`: Rapid consecutive requests drop stale in-flight responses without race condition.
- **`tests/keyboard-accessibility.spec.ts` (4 tests)**:
  - `A11Y-01`: Skip-to-main-content landmark navigation via first Tab key press (WCAG 2.4.1).
  - `A11Y-02 (UX-002)`: Full keyboard focus verification (`toBeFocused()`) on Code Snippet, Business Rule, and Launch Multi-Agent Analysis button with Tab, Shift+Tab, and Enter/Space activation.
  - `A11Y-03`: Verification Lab keyboard traversal across radio fixtures, concurrency levels, form inputs, and test assertion copy.
  - `A11Y-04`: Mobile navigation menu keyboard focus, ARIA expanded state, and Escape key dismissal with focus restoration.
- **`tests/responsive.spec.ts` (20 tests)**:
  - Exhaustive 5-viewport verification matrix (`320×568`, `375×667`, `390×844`, `768×1024`, and `1440×900`).
  - Official Playwright device emulation profiles (`iPhone SE`, `iPhone 8`, `iPhone 14`) with real `isMobile: true`, `hasTouch: true`, and high device pixel ratios (`deviceScaleFactor` 2 & 3).
  - Strict horizontal overflow assertion (`scrollWidth <= innerWidth`).
  - Full primary user flows (Homepage, Verification Lab, PR Analysis, and responsive touch navigation) on every viewport.
- **`tests/mobile-device-emulation.spec.ts` (5 tests)**:
  - `MOB-01`: Server-rendered HTML Meta Viewport tag (`<meta name="viewport" content="width=device-width, initial-scale=1"/>`) verified on all production & preview routes (`/`, `/lab`, `/analyze`, `/about`).
  - `MOB-02`: Official `iPhone 14` device profile (DPR: 3, 390x844) touch navigation, hamburger toggle, and zero overflow.
  - `MOB-03`: Official `iPhone SE` device profile (DPR: 2, 320x568 compact) touch execution of PR Analysis workspace with zero horizontal overflow.
  - `MOB-04`: Official `Pixel 7` Android mobile profile (DPR: 2.625, 412x839) touch execution of Verification Lab and test assertion clipboard copying.
  - `MOB-05`: Official `iPad Mini` tablet touch profile (DPR: 2, 768x1024) hybrid navigation and responsive layout integrity.
  - Photographic evidence artifacts (19 PNGs) saved to [`docs/screenshots/`](docs/screenshots/).

---

## Current verified proof and honest limitations — 24 October 2026

| Check | Observed | Boundary |
|---|---|---|
| [GitHub CI PR #14](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40078459361) | 118/118 Vitest; 57/57 Playwright; lint/TypeScript/build successful | Independent of TestSprite |
| [Genuine PR #14 TestSprite](https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/7a1fa9d9-18a6-4b97-bf58-a922595d05cf) | **96 passed, 0 failed, 1 blocked**; GitHub status **failure** | Not a green PR; keyboard-only case remains Blocked |
| [Hosted read-only smoke, Oct 24](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40089236066) | **10/10** safe GET checks: /, /lab, /analyze, /about, /api/v1/health on **both** public production and PR preview, HTTP 200, Health ok; basic security headers checked | Not a stress test, exploit scan or proof of rate limiting |
| [Natural keyboard proof](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/40080749821) | **6/6 passed**: local production build, PR preview, and production | Separate Playwright tests, not a replacement for TestSprite |
| [Main protection ruleset](https://github.com/allfridhosaragii/FlowGuard-AI/rules/25749816) | Active, requires `test-and-verify` and `TestSprite V3`; PR #14 currently blocked | Draft state also blocks merge |
| [Security triage](docs/SECURITY-QUALITY-FINAL-AUDIT-2026-10-24.md) | **Latest 24 Oct production npm audit reports 1 High advisory in Zod (GHSA-mrhx-c7xc-m3w5)**; previous 23 Oct audit reported zero. Also 12 previously disclosed full/dev advisory chains, 18 Semgrep findings and one ZAP CSP warning | Scanner success does not imply zero findings |

**Submission and identity:** A user-provided organizer announcement extended the deadline to Monday 26 October 2026 11:59 PM Pacific = Tuesday 27 October 13:59 WIB and named `#hackathon-s4-submissions`. The public [event webpage](https://www.testsprite.com/hackathon-s4) still has an older schedule/channel. Confirm the current pinned Discord message and the user's exact TestSprite display name/email before posting. No submission has been made by this audit.

**Additional artifacts:** [current readiness](docs/HACKATHON-SEASON-4-SUBMISSION.md) · [security](docs/SECURITY-QUALITY-FINAL-AUDIT-2026-10-24.md) · [demo runbook](docs/DEMO-RUNBOOK-S4-2026-10-24.md) · [evidence index](docs/EVIDENCE-INDEX-S4-2026-10-24.md) · [unsent submission draft](docs/DISCORD-SUBMISSION-DRAFT-S4-2026-10-24.md).

---

## ✅ Historical test evidence — 21 October 2026 (superseded by newer CI)

- **GitHub Actions**: [run 39527734853](https://github.com/allfridhosaragii/FlowGuard-AI/actions/runs/39527734853) — 78 Vitest tests passed, 43 Playwright browser tests passed, TypeScript and build passed, ESLint 0 errors (24 warnings).
- **TestSprite V3**: [historical PR #1 automated execution](https://www.testsprite.com/dashboard-v3/o/28a6d5ec-2a40-54eb-9bf6-0c87db224fde/projects/570eab99-607a-49fa-96b2-fe5ef724f2d9/execution/4b812fc5-c9f8-4c63-b387-b1e1567df655) — **22 passed, 0 failed, 1 blocked**. The 390×844 mobile TestSprite case was blocked; TestSprite support later clarified the viewport was not configured at project/test-case level. This is **not** a passed TestSprite mobile assertion. Independent Playwright mobile emulation at 390×844 is covered by CI.
- **Automated verification loop**: [PR #1](https://github.com/allfridhosaragii/FlowGuard-AI/pull/1) documents TestSprite PR feedback and GitHub Actions; [Codex audit PR #2](https://github.com/allfridhosaragii/FlowGuard-AI/pull/2) was independently reviewed and merged into the feature branch.

---

## 📑 Hackathon Documentation & Evidence Reports

- 📄 **[Hackathon Season 4 Submission & Audit Report](docs/HACKATHON-SEASON-4-SUBMISSION.md)**: Current evidence-first submission readiness report; clearly separates production results, PR previews and unresolved merge-gate requirements.
- 📄 **[TestSprite Merge Gate & Evidence Document](docs/TESTSPRITE-GATE-AND-EVIDENCE.md)**: Historical CI/TestSprite findings; consult the current readiness report for corrected viewport diagnosis and merge-gate status.
- 📸 **[Photographic Viewport Evidence](docs/screenshots/)**: 19 full-page screenshot artifacts validating 0 horizontal overflow, real touch interactions, and responsive user flows on 5 screen sizes down to 320px width.

---

## 🛠️ Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/allfridhosaragii/FlowGuard-AI.git
cd FlowGuard-AI

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-1.5-flash
# GITHUB_READ_TOKEN=your_github_token

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 🔒 Security & Provenance Policy

- **No Arbitrary Execution**: External repository code is NEVER executed on the application server. The Verification Lab runs exclusively on allowlisted first-party synthetic fixtures.
- **Evidence Precedes Verdicts**: AI findings for external PRs are strictly classified as `POTENTIAL`. Verdicts (`VERIFIED_PASS` or `VERIFIED_FAIL`) are reserved strictly for executed tests.
- **Dynamic Provenance**: Verification evidence records deployment-supplied `VERCEL_GIT_COMMIT_SHA` or `GIT_COMMIT_SHA` when present (otherwise a package-version fallback), fixture identity, and execution timestamps.
- **Read-Only GitHub REST**: All PR inspections are strictly read-only with enforced diff size caps (200 KB max).

---

## 🤖 TestSprite 3.0 Integration Guide

1. **Install TestSprite GitHub App**:
   - Navigate to [TestSprite Console](https://www.testsprite.com/) and install the TestSprite GitHub App for `allfridhosaragii/FlowGuard-AI`.
2. **Pull Request Workflow**:
   - When enabled and correctly configured, TestSprite PR triggers can test matching accessible previews. **The Vercel PR-comment trigger is now Active** with drafts and merge gate ON, targeting PR #14's fixed docs preview; the alternate Vercel status trigger remains Disabled. This proves a real PR #14 loop but **does not yet establish correct dynamic URLs for every future PR**. Do not use Send Test Event: TestSprite Support confirmed its synthetic success can overwrite a real failure.
3. **Assertions**:
   - TestSprite 3.0 can execute assertions directly against the `/api/v1/lab/verify` endpoint to validate state machine invariants.

---

## 👤 Author & Hackathon Submission

**Allfridho Saragi**  
- GitHub: [@allfridhosaragii](https://github.com/allfridhosaragii)  
- Email: pedoprimasaragi@gmail.com  
- Event: **TestSprite Hackathon Season 4**
- Historical [PR #1](https://github.com/allfridhosaragii/FlowGuard-AI/pull/1) and [PR #13](https://github.com/allfridhosaragii/FlowGuard-AI/pull/13) are merged. No project submission is verified.