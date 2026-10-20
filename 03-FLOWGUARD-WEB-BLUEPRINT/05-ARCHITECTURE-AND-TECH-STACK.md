# Target System Architecture, Technologies and ADRs

## Decision: one full-stack TypeScript application
P0 runs as Next.js App Router deployed to Vercel, with shared Zod schemas and no microservices. All sensitive API/model interactions are server-side. **Never execute untrusted PR code in Vercel functions.**

| Layer | Choice | Reason/constraint | Alternatives only if blocked |
|--|--|--|--|
| UI | Next.js + React + TypeScript strict | Full-stack routing & shared typing | Preserve existing HTML only as rollback or interim |
| Styling | Tailwind CSS + shadcn/ui selectively | Build fast, accessible primitives | CSS modules for tiny component set |
| Validation | Zod | Strict request and model-output schemas | JSON Schema if provider/harness requires |
| AI | LLM provider adapter configured by env, max 3 stages | Vendor portability and spend control | Graceful explicit unavailability |
| GitHub | Read-only REST via Octokit/fetch | Public PR + bounded diff | None, do not scrape arbitrary URLs |
| Persistence | Neon Postgres + Drizzle **optional P1** | Durable history when needed | Stateless responses for P0; never fake history |
| Verification | In-process trusted TS fixture harness | Deterministic proof with no shell execution | GitHub Actions trusted fixture job |
| Test | Vitest, Playwright, TestSprite portal | Logic/API/UI + external PR checks | No substitution for actual TestSprite check |
| CI/deploy | GitHub Actions + Vercel preview | PR-driven execution and audit trail | Existing Vercel deployment preserved |

## Data flow
```text
Browser
  -> Next API: /api/v1/analyses (validate public PR + explicit business rule)
     -> GitHub REST: read-only bounded diff, sha, source locations
     -> Requirement Agent -> Risk Agent -> Planner Agent (real provider)
     -> Zod + source/reference guards -> POTENTIAL report
  -> Next API: /api/v1/lab/verify
     -> trust-allowlisted refund fixture runner
     -> invariant checker -> actual observations -> VERIFIED_PASS/FAIL for fixture
  -> /api/v1/health: build/version / optional subsystem availability (never key values)
GitHub feature PR -> Vercel Preview READY -> TestSprite GitHub App -> running suite -> PR evidence
```

## Domain separation
- `src/lib/domain/refund/` owns pure deterministic state machine and policy, isolated from UI.
- `src/lib/verification/` owns harness, test fixture contract, bound parameters and evidence.
- `src/lib/agents/` owns schemas and orchestration; LLM suggestions cannot issue `VERIFIED`.
- `src/lib/github/` owns strict parsed PR URL, bounded fetch, provenance, rate handling.
- `src/app/api/` validates input, uses no unsafe eval/exec, applies quotas.
- `src/components/` follows design folder source-of-truth.

## Key Architecture Decision Records (ADRs)
- ADR-01: Do not claim proof for external PR unless executing its code in trusted verified isolated runner, excluded from P0.
- ADR-02: No automatic code patches, comments, merges or repo writes from FlowGuard; GitHub reads only.
- ADR-03: UI status based on backend `verdict` source; client cannot arbitrarily set verified status.
- ADR-04: Provider adapter is optional for local lab; failure is visible, not replaced by canned fake AI.
- ADR-05: Database persistence not required for demonstrable core workflow; transient results clearly marked.
- ADR-06: TestSprite GitHub App verifies **FlowGuard app**, not equivalently the external PR that FlowGuard analyzed.

## Environment names (no real secret values)
```
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=
GITHUB_READ_TOKEN=            # optional read-only; server side
DATABASE_URL=                # optional P1 only
ANALYZE_ENABLED=true
PR_ANALYSIS_ALLOWLIST=allfridhosaragii/FlowGuard-AI
```
Use Vercel environment settings; do not commit actual `.env`.

## Integration constraints
Vercel preview must be URL-accessible to TestSprite. PR metadata fetched from GitHub REST, not by following user-supplied external redirects. No need to build FlowGuard's own GitHub App (the TestSprite-installed app is distinct and required for judging).

Detailed baseline: `REFERENCE-TECHNICAL-BLUEPRINT/docs/04-system-architecture.md`.
