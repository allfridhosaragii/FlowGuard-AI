# Website User Journeys, Routes & Content Hierarchy

## Information architecture — P0 routes only
`/` (landing / trust framing), `/lab` (deterministic refund verification), `/analyze` (manual public PR + rule → AI results), `/about` (how it works + scope). Optional `/results/[id]` only when durable persistence actually exists. No fake dashboard with counts populated from fabricated data.

## Journey A — judge tries product without login (<90 seconds)
1. Open `/`; hero promise "From business rules to testable evidence" and button `Try Verification Lab`.
2. `/lab`: select `Vulnerable`, set concurrent requests 2, key `retry-abc`, press `Run replay`.
3. Loading state disables duplicate clicks; actual API returns `observedRefundCount=2`, expected 1 and verdict `VERIFIED_FAIL` scoped to `first-party fixture`.
4. Judge changes only fixture to `Fixed`, replays same inputs; observes count 1 `VERIFIED_PASS`.
5. Open evidence drawer: run ID, fixture version, request vector, actual/expected counts, run time, notes. Copy JSON works.
6. About explains why this does NOT prove an arbitrary GitHub PR has a bug.

## Journey B — developer analyzes actual public PR (2–4 minutes)
1. Open `/analyze`; paste public PR URL + human rule.
2. Validate URL and rule immediately; unsupported private repos/scope return actionable error.
3. Backend fetches public GitHub PR metadata/diff and shows repository, number, SHA, changed files as provenance.
4. Requirement Agent extracts explicit invariant, shows human-readable version; Risk Hunter produces grounded hypothesis, Planner describes bounded test.
5. Product displays `POTENTIAL` findings with sourced lines and suggested verification; no verified status by reading alone.
6. User can choose to examine first-party lab as analogous demonstration; UI clearly says not tested against PR code.
7. Retry errors do not lose entered URL/rule. Copy/report works only for real generated content.

## Website sections/components
**Header**: brand, Home, Lab, Analyze, About, GitHub repository link, optional theme toggle only if built.
**Homepage**: succinct value proposition, 3-step mechanism, actual demo CTA, support boundary, confidence taxonomy, tiny FAQ, working repo link. No fake testimonial/badge/metrics.
**Lab**: left controls; right verdict/result; evidence drawer; accessible mobile stack.
**Analyze**: public PR URL, business rule textarea, example input (from actual accessible repo), stage state list, findings summary with citations to diff; errors and source scope.
**About**: problem, model limitations, difference from TestSprite, transparency about fixture-only verification, security/privacy, documentation links.

## Copy dictionary: enforce exactly
- `POTENTIAL`: "Possible business-rule violation — not yet reproduced on this PR."
- `VERIFIED_FAIL`: "Test executed on [specific target/fixture] and observed a rule violation."
- `VERIFIED_PASS`: "This specific executed test passed on [specific target/fixture]."
- `INCONCLUSIVE`: "Unable to determine outcome with available evidence."
- `ERROR`: "Analysis or test could not complete. No verdict was issued."
- `UNSUPPORTED_SCOPE`: "This PR exceeds the current review limits; no partial conclusion was returned."

## Mobile acceptance
At 320–375px: single-column editor/results, no horizontal body scrolling, minimum tap-target ~44 CSS px, resizable textarea, no code result truncation without scroll control, buttons stay visible on virtual keyboard. At 768+: two-column only if readability retained. All controls label-associated, keyboard usable, focus visible, status announced via ARIA live region. Respect reduced motion.

See `../01-DESIGN/` for tokens and exact UX specs. **Do not reproduce any fake telemetry terminal** from existing demo.
