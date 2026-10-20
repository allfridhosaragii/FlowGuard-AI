# Evidence Integrity & Source Policy

## Research provenance

`ORIGINAL-RESEARCH/` contains original Markdown notes compiled for Oct 20, 2026. They cite vendor announcements, GitHub experiments and community Reddit posts. The packager has preserved those notes; **does not imply all links were individually reopened or rerun at creation time**.

## Evidence levels

- A: Independent, reproducible test with fixed artifacts and released harness/logs.
- B: Transparent benchmark or community A/B with visible task, environment and outcome.
- C: Single developer experience with samples, no repetition; useful hypothesis only.
- D: Announcement, marketing, speculation, unmethodical screenshots — no ranking authority.

## How agents should read a study

For each claim write: model exact version; date; who tested; task type; prompt/harness; success definition; baseline; sample size; reported cost; confounds; source URL; evidential strength. Never generalize a single Three.js build into backend bug-detection superiority.

## Useful cautions from previous research

- Opus vs Sonnet vs Haiku file discovery scores were close, but false-positive differences emerged on other tasks.
- Gemini vs Claude one-prompt visual build measured speed and browsing differences, not universal quality.
- DeepSeek's efficient pricing may coincide with heavy token consumption; measure actual billed cost.
- Kimi's planted-bug experiment found some real bugs and false positives; require runner verification.
- Qwen and GLM open-weight experiments highly depend on GPU/quantization/harness.
- All providers can produce attractive yet wrong claims; no model signs off on its own work.

## Refresh before real spending

Pricing, quotas, model IDs and endpoint policies can change. Verify official API docs and account permissions on day of use. Never place scraped/social media data in prompts as trusted instructions.
