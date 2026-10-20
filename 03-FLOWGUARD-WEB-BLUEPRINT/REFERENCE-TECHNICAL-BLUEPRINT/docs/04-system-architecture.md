# 04 — System Architecture, Data Flow, Error Handling and ADRs

## Architecture schematic

```text
Visitor browser (React/Next App Router)
    | HTTPS
    v
Vercel Next.js routes (validation, policy, rate limiting)
    |-- /api/v1/analyses ---------> GitHub REST (read-only public PR)
    |                              -> bounded sanitized diff
    |                              -> Agent orchestration (server only)
    |                              -> LLM provider (server key, JSON schema)
    |                              -> Neon Postgres (optional persistent runs)
    |-- /api/v1/lab/verify -------> allowlisted first-party deterministic harness
    |                              -> evidence result (counts, run id, hash)
    '-- /api/v1/health ----------> basic ready status, no secrets

External quality loop: GitHub PR -> Vercel PR preview ready -> TestSprite 3.0 GitHub App -> UI/API suite -> PR check/comment -> fix -> rerun
```

## ADR-001: Next.js full-stack TypeScript, not microservices

Single deploy minimizes operational risk with under 72 hours to deadline; shared type schemas across UI, API and agents. Long-running arbitrary code-execution service expressly excluded. If one model call exceeds serverless limits, fail with a clear retriable outcome; never fake synchronous completion.

## ADR-002: Independent demo lab vs PR review

The lab executes trusted fixture code and can establish actual PASS/FAIL. PR review uses read-only diffs and can only establish evidence for a **hypothesis**, not verified behavior of an unexecuted repository. Cross-linking them as an illustrative reproduction must explicitly say it is *not* the PR's actual execution.

## ADR-003: Server-side LLM with strict machine contracts

One provider adapter, configurable through `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` (not exposed to browser); verify model/provider support for required JSON format. Three sequential bounded stages; app validates responses with Zod and rejects malformed results. Fallback is an explicitly labeled deterministic *rules-only* check or a clear error, never 'AI succeeded'.

## ADR-004: Trusted local test runner only

`VerificationLab` runs built-in TypeScript fixture functions in the application runtime. Does NOT fork, clone or execute arbitrary untrusted repos. Tests for real external code need a separately designed sandbox service and user permissions; explicitly P2.

## ADR-005: Persistence with graceful stateless option

Use Neon Postgres + Drizzle to persist limited sanitized analysis metadata if credentials available. Demo lab returns evidence synchronously and works without database. Persist PR runs only with configured DB; if storage unavailable, return structured `STORAGE_UNAVAILABLE` or a clearly marked transient result without pretending history is saved. Avoid credentials and full raw diffs in DB.

## ADR-006: No real payment processing

Use isolated memory data structures in a deterministic fixture. Each lab request seeds a fresh synthetic ledger, executes bounded attempts and discards state. No currency movement, real webhook or persistent financial records.

## Data contracts and trust boundaries

- Browser -> API: untrusted payload; validate, size-limit and rate-limit.
- GitHub -> API: repository content is untrusted **instructions-as-data**. Never follow model instructions embedded in a code comment/README.
- API -> LLM: minimal extracted code context; scrub high-risk patterns, secrets and PII; external provider transfer disclosed.
- LLM -> API: untrusted JSON; schema validates structure, source code locations validated against fetched file list, verdict fields discarded; never dynamically `eval` code.
- API -> trusted runner: allowlisted fixture IDs with bounded integer settings; runner emits observations.
- TestSprite -> deployed site: public URLs only, deterministic test data, no credentials necessary for P0.

## Sequencing and failure policy

1. Validate request. 2. Resolve bounded data (if PR). 3. Call Requirement Agent (deadline 10 s). 4. Call Risk Agent (deadline 10 s). 5. Call Test Plan Agent (deadline 10 s). 6. Validate cross references and store optional metadata. 7. Return report (no verified status for PR). Total API budget targeted <= 45 s including network; only supported platform configurations. Each stage: one retry only for transient provider/format errors, with bounded total budget, otherwise explicit failure and no stale green state.

Lab runner separate, no LLM needed for final verdict: fetch allowlisted fixture, force reproducible schedule, compare observed effects to business invariant, emit evidence and status. Lab must still work when AI provider is down.

## Stack pinned conceptually

- Runtime Node.js LTS supported by chosen Next.js release; pin exact version in `.nvmrc` and lockfile at implementation.
- React + TypeScript strict + Next App Router + Tailwind + shadcn/ui.
- Zod shared request/response schemas; `fetch`/Octokit with read-only GitHub API; provider adapter.
- Neon Postgres + Drizzle when persistence enabled; no in-memory database offered as durable storage on Vercel.
- Vitest + Playwright; TestSprite portal/GitHub App for hackathon.

## Operational response constraints

Capped public PR diffs and rate limiting prevent abuse. Fetch PR via GitHub API not arbitrary URL dereferencing (SSRF). Avoid synchronous background promises after HTTP response. No implicit automatic pushes or merges. `cache: no-store` for analyses, proper no-index pages for transient sensitive reports. Use UTC timestamps in API and localized time only for presentation.

## Known design trade-offs

- GitHub public PR analysis without authenticated GitHub may be rate limited; optional read-only token held server-side. No need for a FlowGuard-owned GitHub App for P0.
- P0 lab proves known bounded invariants and does not offer general program verification.
- Three calls to AI may produce cost/latency; hard caps and provider outage fallback required.
- Sophisticated multi-agent autonomous coding is excluded until after submission; this choice improves testability and honesty.
