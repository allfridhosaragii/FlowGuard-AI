# FlowGuard AI 🛡️

> **AI-Powered Bug Hunting & Behavioral Risk Detection Platform**  
> *Don't just review code. Prove it works.*  
> Built for **TestSprite Hackathon Season 4**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?logo=vercel)](https://flowguard-ai-smoky.vercel.app/)
[![Build Status](https://img.shields.io/badge/Next.js-15.1.7-black?logo=next.js)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passing-success)](tests/)

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
3. **Agent C (Verification Planner)**: Synthesizes reproducible test specifications and **TestSprite 3.0** assertions.
4. **Controlled Verification Lab**: Executes real in-process parallel worker threads against target state machines, proving whether an invariant holds or fails.

---

## 🚀 Live Application Routes

| Route | Description |
|---|---|
| [`/`](https://flowguard-ai-smoky.vercel.app/) | **Landing Page** with core value proposition, static vs behavioral comparison, and live health status. |
| [`/lab`](https://flowguard-ai-smoky.vercel.app/lab) | **Controlled Verification Lab**: Toggle between vulnerable and fixed refund state machines, configure concurrency (1–5x), run real parallel threads, and inspect execution evidence. |
| [`/analyze`](https://flowguard-ai-smoky.vercel.app/analyze) | **PR & Code Analysis Workspace**: Submit a public GitHub PR URL or code diff + business rule to run the 3-agent pipeline. |
| [`/about`](https://flowguard-ai-smoky.vercel.app/about) | **Architecture & Security**: Invariant formal definitions, state machine progression, and security isolation rules. |

---

## 🔌 API Endpoints (v1)

- `GET /api/v1/health`: System status, build version, and configured subsystem flags.
- `POST /api/v1/lab/verify`: Executes the controlled verification test harness with bounded concurrency vectors.
- `POST /api/v1/analyses`: Runs the 3-agent orchestration pipeline on GitHub PR diffs or code inputs.

---

## 🧪 Automated Testing

FlowGuard AI is built testing-first with Vitest. Run the full automated test suite locally:

```bash
# Run all unit, agent, and verification tests:
npm test

# Run tests in watch mode:
npm run test:watch
```

### Test Coverage Highlights:
- **`tests/verification.test.ts`**:
  - `V-01`: Vulnerable fixture under concurrency 2 produces duplicate refunds (`VERIFIED_FAIL`).
  - `V-02`: Fixed fixture under concurrency 2 commits exactly once (`VERIFIED_PASS`).
  - `V-03`: Single request concurrency 1 properly passes.
  - `V-04`: Fixed fixture under concurrency 5 maintains strict idempotency.
  - `V-05`: Conflicting idempotency key with differing amounts is rejected.
  - `V-06` & `V-07`: Input bounds and required parameters are strictly enforced.
- **`tests/agents.test.ts`**: Verifies invariant extraction, risk hunting, test planning, and full 6-stage orchestrator pipeline.
- **`tests/github.test.ts`**: Verifies URL parsing, read-only boundary enforcement, and error handling.

---

## 🛠️ Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/allfridhosaragii/FlowGuard-AI.git
cd FlowGuard-AI

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
# Create .env.local if you wish to connect a live LLM provider or GitHub read token:
# LLM_API_KEY=your_key
# LLM_MODEL=gpt-4o-mini
# GITHUB_READ_TOKEN=your_token

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 🔒 Security & Provenance Policy

- **No Arbitrary Execution**: External repository code is NEVER executed on the application server. The Verification Lab runs exclusively on allowlisted first-party synthetic fixtures.
- **Evidence Precedes Verdicts**: AI findings for external PRs are strictly classified as `POTENTIAL`. Verdicts (`VERIFIED_PASS` or `VERIFIED_FAIL`) are reserved strictly for executed tests.
- **Read-Only GitHub REST**: All PR inspections are strictly read-only with enforced diff size caps (100 KB max).

---

## 👤 Author & Hackathon Submission

**Allfridho Saragi**  
- GitHub: [@allfridhosaragii](https://github.com/allfridhosaragii)  
- Email: pedoprimasaragi@gmail.com  
- Event: **TestSprite Hackathon Season 4**