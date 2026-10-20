# Screen Contracts / Visual QA

## `/` Landing

- Headline: **Find the business logic your tests missed.**
- Subheadline jujur: hypothesis + verified evidence for *supported* controlled cases.
- CTA: `Try Verification Lab` -> `/lab` ; `Analyze a Public PR` -> `/analyze`.
- Diagram 3 steps: Business rule -> Risk hypothesis -> Test evidence (lab only for verified).
- Transparansi: supported/refused cases dan tautan repo.

## `/lab` Verification Lab

**Inputs:** fixture `vulnerable|fixed`, `idempotency_key`, `amount_minor_units`, `parallel_requests` 1–5, `runs` 1–20. **Action:** `Run Verification`.

**Results:** actual request parameters; execution timestamps; side-effect count; attempt IDs; fixture hash/version; observed events; invariant; PASS/FAIL/INCONCLUSIVE/ERROR; run ID; copy sanitized report. Verified text secara eksplisit `Verified in FlowGuard controlled lab`. Jangan samakan dengan external PR.

**Crucial:** tombol `Run same test on fixed version` mempertahankan parameter persis.

## `/analyze` PR Risk Review

**Inputs:** public GitHub PR URL, free-text business rule 10–2,000 chars; hidden repo secret rejected. URL allowlist `github.com/{owner}/{repo}/pull/{n}` only, HTTPS.

**Data:** GitHub metadata repo/PR/sha, diff size caps and file list. Batas 20 file, 100KB patch, 3k changed lines jika backend mengikuti blueprint. Di atas limit -> error `Unsupported scope`, bukan hasil terpotong diam-diam.

**Output:** agent stages with status/timing, invariant statement, candidate risks, source link valid, rationale, suggested test specification. Badge `POTENTIAL`; no fabricated pass/fail.

## `/about`

Unsupported: arbitrary repo execution, guaranteed security detection, private repo support (P0), "zero-day" coverage. Explain privacy, API calls, cost/rate limits, synthetic lab limitations, product repo license facts only when verified.

## Empty / loading / failure states

- Empty result: `No analysis has been run yet.`
- Incomplete AI: `Could not complete analysis. No verdict was recorded.`
- Not supported: `This PR is outside the supported size or file-type limits.`
- Evidence mismatch: `The lab result does not establish whether this external PR is vulnerable.`

## Error UX

Preserve input when retrying. Map technical errors to short action: GitHub unavailable -> retry; model quota -> retry later; invalid input -> inline correction. Never paint a failure green.
