# API, Persistence, Validation & Versioned Contracts

## API routes (versioned)
| Route | Method | Request | Response | Major failures |
|--|--|--|--|--|
| `/api/v1/health` | GET | none | `{status,buildVersion,features}` | never display secret |
| `/api/v1/lab/verify` | POST | allowlisted fixture + bounded vector | evidence + verified verdict scoped to fixture | `INVALID_INPUT`, `RUNNER_ERROR` |
| `/api/v1/analyses` | POST | `{githubPrUrl,businessRule}` | run id, PR provenance, staged agent findings (`POTENTIAL`) | `GITHUB_NOT_FOUND`, `RATE_LIMITED`, `AI_UNAVAILABLE`, `SCHEMA_INVALID`, `UNSUPPORTED_SCOPE` |
| `/api/v1/analyses/:id` | GET | known id | result only if legitimately persisted | `404` or `STORAGE_UNAVAILABLE` |

**The most detailed API definition lives in** `REFERENCE-TECHNICAL-BLUEPRINT/specs/openapi.yaml` (inspect consistency against implementation before claim). Do not invent `TestSprite` injection/upload API endpoints unless verified against current official documentation.

## DB choice
Neon PostgreSQL + Drizzle is optional, nonblocking P1. If configured, minimal tables: `projects` (reference repo), `analysis_runs` (source SHA, status, model/version, timing), `findings` (risk hypothesis and provenance), `verification_runs` (fixture input, observations, verdict, target type/version). Schema proposal in `REFERENCE-TECHNICAL-BLUEPRINT/specs/schema.sql`.

## If DATABASE_URL absent
- P0 must still function for synchronous lab and analysis response.
- No "history saved" UI, fake run history, or shareable URL that returns 404.
- Copy/export report only from current actual response.
- If route requires persistence, return `STORAGE_UNAVAILABLE` with precise message, not silent memory cache pretending durable storage.

## Request-response integrity
- Zod schema validates body + bounds.
- Rate limit / size limit on anonymous public access.
- Unique request and run IDs.
- Evidence is signed/hash-linked only if algorithm is implemented; don't claim tamper proof without verifying cryptographic design.
- GitHub source commit SHA, PR URL and changed paths must match fetched API metadata.
- Render external diff and model explanations using safe text rendering, no `dangerouslySetInnerHTML` from untrusted source.

## Error state mapping
`INVALID_INPUT` 400; `NOT_FOUND` 404; `RATE_LIMITED` 429; `UNSUPPORTED_SCOPE` 422; upstream provider errors 502/503 or appropriately documented; app timeout 504 if applicable. Error object `{error:{code,message,requestId,retryable}}`; do not expose raw stack trace/client secret.

## Contract change discipline
Whenever agent edits API shape: update OpenAPI + Zod + handler + UI typed client + unit/integration tests in same PR. Do not let agent invent a new endpoint based on outdated README.
