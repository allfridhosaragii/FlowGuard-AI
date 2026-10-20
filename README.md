# FlowGuard AI 🛡️

> **AI-Powered Bug Hunting & Behavioral Risk Detection Platform**  
> *Don't just review code. Prove it works.*  
> Built for **TestSprite Hackathon Season 4**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?logo=vercel)](https://flowguard-ai-smoky.vercel.app/)
[![Build Status](https://img.shields.io/badge/Next.js-15.1.7-black?logo=next.js)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-30%20Passing-success)](tests/)
[![Playwright E2E](https://img.shields.io/badge/Playwright-9%20Passing-success)](tests/e2e.spec.ts)

🔗 **Live Production URL**: [https://flowguard-ai-smoky.vercel.app/](https://flowguard-ai-smoky.vercel.app/)  
📦 **GitHub Repository**: [https://github.com/allfridhosaragii/FlowGuard-AI](https://github.com/allfridhosaragii/FlowGuard-AI)

---

## 🌟 The Problem FlowGuard AI Solves

Traditional pull request code reviews and static linters check syntax, types, and formatting, but miss critical runtime regressions:
- Duplicate refunds caused by concurrent payment retry races
- Missing idempotency keys on settlement requests
- Authorization logic bypasses
- Invalid state machine transitions under network jitter

FlowGuard AI bridges the gap between **code review** and **runtime verification**:
1. **Agent A (Requirement Analyst)**: Extracts formal mathematical invariants from human business rules.
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
3. **Transparent Heuristic Fallback**: When no API key is provided, FlowGuard AI runs deterministic static AST analysis. The UI explicitly discloses `isRealModel: false` and `heuristic-offline-analyzer (fallback)` — never claiming simulated or heuristic outputs are from a real neural model.

---

## 🧪 Automated Testing

FlowGuard AI maintains a dual test suite with Vitest and Playwright E2E:

```bash
# 1. Run all 30 Vitest unit & integration tests:
npm test

# 2. Run Playwright End-to-End browser tests (headless Chromium):
npx playwright test

# 3. Run Vitest in watch mode:
npm run test:watch
```

### Test Coverage Breakdown:
- **`tests/verification.test.ts` (9 tests)**:
  - `V-01`: Vulnerable fixture under concurrency 2 produces duplicate refunds (`VERIFIED_FAIL`).
  - `V-02`: Fixed fixture under concurrency 2 commits exactly once (`VERIFIED_PASS`).
  - `V-03`: Single request concurrency 1 properly passes.
  - `V-04`: Fixed fixture under concurrency 5 maintains strict idempotency.
  - `V-05`: Conflicting idempotency key with differing amounts is rejected.
  - `V-06` & `V-07`: Input bounds and required parameters are strictly enforced.
  - `V-08`: Concurrency labeled accurately as `concurrent asynchronous requests`.
  - `V-09`: Test assertions target the real `/api/v1/lab/verify` endpoint.
- **`tests/agents.test.ts` (9 tests)**:
  - Invariant extraction, risk hunting (stripping comments to avoid false-positive locks), benign diffs returning clean empty findings (`NO_RISK_FOUND`), test planning with real endpoints, and 6-stage orchestrator pipeline.
- **`tests/api-integration.test.ts` (10 tests)**:
  - Integration tests for `GET /api/v1/health`, `POST /api/v1/lab/verify`, and `POST /api/v1/analyses` including boundary validation, whitespace rejection, and error handling.
- **`tests/github.test.ts` (2 tests)**:
  - Read-only GitHub REST URL parser and diff size limit enforcement (100 KB max).
- **`tests/e2e.spec.ts` (9 tests)**:
  - `E2E-01`: Landing page navigation and honest CTAs.
  - `E2E-02`: Controlled Lab reproducing race condition on vulnerable fixture.
  - `E2E-03`: Controlled Lab verifying idempotency on fixed fixture.
  - `E2E-04`: PR & Code Analysis workspace running multi-agent pipeline.
  - `E2E-05`: Architecture & Invariants page formal definitions.
  - `E2E-06 (LAB-008)`: Generated verification assertion copied to clipboard with honest feedback.
  - `E2E-07 (LAB-007)`: Empty idempotency key rejected with actionable validation and clears previous report.
  - `E2E-08 (ANA-004)`: Empty code snippet rejected before analysis without fake report.
  - `E2E-09 (UX-001)`: Mobile viewport (390x844) supports all primary user flows.

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
- **Dynamic Provenance**: Verification evidence logs the live commit SHA (`git rev-parse HEAD`), fixture identity, and execution timestamps.
- **Read-Only GitHub REST**: All PR inspections are strictly read-only with enforced diff size caps (100 KB max).

---

## 🤖 TestSprite 3.0 Integration Guide

1. **Install TestSprite GitHub App**:
   - Navigate to [TestSprite Console](https://www.testsprite.com/) and install the TestSprite GitHub App for `allfridhosaragii/FlowGuard-AI`.
2. **Pull Request Workflow**:
   - Each PR opened against `main` automatically triggers Vercel Preview Deployments and TestSprite automated regression runs.
3. **Assertions**:
   - TestSprite 3.0 can execute assertions directly against the `/api/v1/lab/verify` endpoint to validate state machine invariants.

---

## 👤 Author & Hackathon Submission

**Allfridho Saragi**  
- GitHub: [@allfridhosaragii](https://github.com/allfridhosaragii)  
- Email: pedoprimasaragi@gmail.com  
- Event: **TestSprite Hackathon Season 4**