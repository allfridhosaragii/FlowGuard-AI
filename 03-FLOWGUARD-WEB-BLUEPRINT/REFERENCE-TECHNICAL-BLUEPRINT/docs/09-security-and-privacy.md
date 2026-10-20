# 09 — Security, Privacy, Threat Model and Data Retention

## Security posture

**Trust nothing from a PR, website input, LLM response, or test-plan JSON.** The only executable test code in P0 is trusted, reviewed first-party fixture code. The application may analyze public PR diff text but never executes it. This is the central safety boundary.

## Assets and trust boundaries

| Asset | Boundary | Protection |
|---|---|---|
| LLM API key | Vercel server | Environment secret, server-only, never `NEXT_PUBLIC_*`, rotation if exposed |
| Optional GitHub API token | Vercel server | Public-repo read-only fine-grained scope, least privilege; omit if anonymous calls suffice |
| PR source code text | GitHub -> backend -> external LLM | Inform user text leaves server for provider; minimize content and redact likely credentials before sending |
| Business rules | Browser -> backend | Input validation, max length, TTL deletion, no analytics recording raw content |
| Report ID and result | Backend -> browser | Random unguessable ID, limited TTL, no search indexing, no sensitive data in URLs |
| Test evidence | Fixture executor -> result | Derived only from observed events; associated with target/build; never model-generated verdict |
| CI secrets | GitHub/Vercel/TestSprite | No exposure to untrusted fork code, restrict PR/workflow token rights |

## STRIDE-style risk register

| Threat | Attack | Mitigation | Verification |
|---|---|---|---|
| Spoofing | Fake `github.com` URL using subdomains/punycode/credentials | Parse URL and exact hostname `github.com` and `/owner/repo/pull/id`; construct REST API URL, no arbitrary fetch | SEC-02 |
| Tampering | AI changes `status` to VERIFIED | Executor-only status transition; schema rejects agent-supplied verified verdict | AG-03 |
| Repudiation | Untraceable failure claim | Run ID, input hash, template/fixture/commit version, UTC and source refs | VER-03 |
| Information disclosure | Token appears in client bundle or logs | Environment scoped server only, redact, no sensitive request bodies in logs | SEC-01 |
| Denial of service | Excessive PR size, replay count, AI calls | Per-IP/day quotas, token/model budgets, request size, timeouts, 429/413 | SEC-03 |
| Elevation of privilege | Malicious PR injects commands via AI | No command tool, no code execution, no privilege-bearing GitHub actions | AG-05, SEC-05 |
| XSS | PR body or finding includes HTML | Render as escaped text/React text node, strict CSP | SEC-04 |
| Data leakage | Feeding repo content/credentials to provider | Redact common secret patterns, limit diff size, privacy disclosure | SEC-01 + manual |
| SSRF | User submits internal URL via URL field | Restrict to exact public GitHub PR URL and GitHub REST API | SEC-02 |
| Cross-run evidence confusion | Claim external PR proved by local fixture | Explicit target binding and status scope in report | VER-03, UI-06 |

## Retention and privacy defaults

- Public demo accepts synthetic data only; screen copy warns users not to paste private API keys or proprietary code.
- Store minimum: run ID, public PR URL, SHA, synthetic fixture output, sanitized agent notes. Full PR patch not persisted (memory per request only).
- Set 24-hour retention for transient optional persisted analysis reports; implement scheduled cleanup or on-read expiry, with 7-day backup policy only if provider supports and configured. No invented 'auto-delete' claim unless actual cleanup works.
- Do not collect email/auth for P0 demo. If user chooses to share a report link, warn that possession of link may grant access to its content.
- `robots: noindex` for result pages; API `Cache-Control: no-store`; security headers; basic Content Security Policy compatible with deployment.
- No user data sold, no third-party analytics by default in P0; publish actual dependencies and providers.

## GitHub Actions precautions

`pull_request` with minimum `permissions: contents: read` for lint/build/unit; avoid `pull_request_target` with checkout of untrusted head or secrets. If future self-hosted code execution, require ephemeral sandbox/containers, network control and strict memory/CPU/time quotas. GitHub warning: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target

## Secrets storage

`.env.example` lists variable names but no values. `.env.local` gitignored; Vercel env vars server-only; separate Preview vs Production settings where relevant; optional provider base URL must be validated to prevent sending API keys to an attacker-specified host; never allow browser-supplied custom AI endpoint in P0.

## Manual pre-submission security audit

Search repository history (not only current tree) for API keys; check `NEXT_PUBLIC_` vars; inspect network requests in browser; test hostile URL and prompt-injection inside business text; verify XSS encoding; require no live production payment integrations; document which repo code crosses to AI provider. Do not assert audited secure without recorded run.
