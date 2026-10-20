# 03 — User Journeys, UI/UX, Content and Accessibility

## Design thesis

A restrained professional developer tool, not a cyberpunk theater. **Light mode by default**, dark optional, one purposeful accent, monospace only for identifiers/code, readable body type, status communicated with shape/text rather than color alone. No animated fake log feed, fake live status, decorative stock counters or misleading 'AI' badges.

## Information architecture

1. `/` — landing with value proposition, proof-oriented example, 'Try Verification Lab', 'Review PR' CTAs, limitation statement.
2. `/lab` — self-contained deterministic lab with scenario settings, step-by-step execution evidence and repeat button. No sign-in required.
3. `/analyze` — GitHub public PR URL + business rule form, run/timeout/limits; dynamic agent progress.
4. `/analyze` after submission — inline report with **Potential Risks**, **Suggested Verification**, and source links, each with provenance. Persisted `/analyses/[id]` detail is P1, only when database is configured and GET endpoint is implemented.
5. `/about` — transparent supported / unsupported capability list, privacy and credits use.

**No dashboard/accounts for P0**: demo should start immediately and never be obstructed by authentication. A future authenticated dashboard belongs in P2.

## Primary user journeys

### UJ-01: New visitor to evidence

Landing -> click 'Try the lab' -> choose vulnerable fixture -> click 'Run verification' -> see FAIL with observed two refund events for the same key -> choose fixed -> click 'Run same test' -> see PASS with exactly one event -> inspect evidence and source fixture link. Target: <= 6 obvious actions without creating an account.

### UJ-02: Reviewing a public PR

`/analyze` -> paste valid GitHub PR URL and business rule -> submit -> see stage progress (fetch, requirements, risk, test plan) -> report -> hypothesis labeled **Not yet verified against this repository** -> inspect precise code references and suggested steps. If unavailable/oversized, display a safe error instead of a fabricated finding.

### UJ-03: Error recovery

Submit malformed JSON / invalid PR -> inline field error with concise instruction -> fix -> resubmit. AI offline -> alert 'Analysis unavailable; no verdict was produced', keep inputs intact -> retry after backoff.

## Components

- `GlobalNav`, `FeatureStatement`, `PRInputForm`, `BusinessRuleEditor`, `ScenarioSelector`, `RiskBadge`, `AgentStepProgress`, `VerificationControls`, `EvidenceTimeline`, `SourceReference`, `RawJSONView`, `ErrorNotice`, `PrivacyBanner`, `Footer`.
- Cards/panels use simple neutral borders; scrollable diff/code region; code copy with success feedback; no clickable dead UI.
- A clear distinction between *candidate finding* and *verified failed test* appears next to every item.

## State design

`idle`, `validating`, `fetching_pr`, `requirements`, `risk_hunter`, `verification_plan`, `executing_fixture`, `complete`, `partial`, `error`, `timed_out`. Every long operation gets textual `aria-live` status. Skeleton loading is real only while work is in progress; no fixed delay to imply model activity.

## Accessibility definition

- WCAG 2.2 AA as a target, tested rather than claimed as certified.
- Labels and descriptions for each input, error tied with `aria-describedby`, status with `aria-live=polite`, semantic main/nav headings and buttons.
- Visible focus outlines, keyboard tab order, no hover-only affordances, Escape behavior for dialogs, 44x44 px touch targets where feasible.
- Color contrast >= 4.5:1 for normal text, 3:1 for essential large UI elements; verify with a checker.
- Respect `prefers-reduced-motion`, support zoom 200%, 320px width without horizontal page overflow.
- Test on mobile widths 320/375/390, tablet 768, desktop 1024/1440 plus dark mode.

## Writing guidance

- Hero: **'Find the business logic your tests missed.'**
- Subcopy: 'Turn a business rule and code change into a reproducible risk hypothesis. Verify supported cases with an actual test run.'
- Unverified: 'Potential risk — not proven against this code.'
- Verified FAIL: 'Verified failure in FlowGuard's controlled lab.'
- Verified PASS: 'The tested fixture passed this invariant.'
- Error: 'We couldn't verify this run. No pass/fail verdict was recorded.'
- Avoid: '99.8% accuracy', '<120 ms AI inference', 'zero-day protection', 'works with every project', 'never fails'.

## Screen-by-screen test acceptance

`/`: navigation and feature links work; `/lab`: editable inputs change replay parameters and actual output; `/analyze`: disables submission until valid; report: reports source, status and evidence without ambiguity; `/about`: lists constraints and privacy. UI test IDs in 08-qa-and-traceability.md.
