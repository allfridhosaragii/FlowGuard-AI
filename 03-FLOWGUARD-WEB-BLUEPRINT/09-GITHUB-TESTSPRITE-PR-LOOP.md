# GitHub PR + Vercel Preview + TestSprite 3.0: Season 4 Proof Loop

## Critical distinction
- **FlowGuard feature**: read a public PR to identify *potential business risk*; initially manual, read-only, not automatically running target repo code.
- **TestSprite feature**: evaluate FlowGuard's own *web app* through portal-generated E2E/API tests triggered on GitHub deployments. This exact PR evidence is required by hackathon.
- Do not pretend FlowGuard owns TestSprite's test generation API or GitHub App; official docs describe TestSprite GitHub integration separately.

## Official setup (verify live UI labels may change)
1. Ensure repo public with correct source and README, and Vercel linked to *same* repository.
2. On TestSprite web portal, import *live* FlowGuard site and generate working test suite (previously 23 planned tests — plans alone aren't runs).
3. Ensure a feature PR creates Vercel preview with an actual accessible deployment event and URL. If no preview deployment, **stop and fix Vercel**: TestSprite cannot test nonexistent preview.
4. TestSprite `Workspace Settings → Connections → Integrations` → GitHub `Connect`, authorize only project repo.
5. Open project's `GitHub Action` tab → add `Pull Request` trigger, target correct repo / stage / preview URL pattern. Select event after deployment Ready, not build started.
6. Observe bot comment or status check in actual PR; inspect link to TestSprite run, passing/failing assertions and artifacts.
7. Configure `Blocking PRs` if supported by workspace and repo settings; verify failed test truly blocks merge, not just badge in UI.
8. Push valid bug fix to SAME PR, confirm Vercel preview updates and TestSprite reruns on its own. Capture actual events and source commit SHAs.
9. Update README with suite coverage and demo link, never paste private TestSprite credentials.

## Two-scene demo strategy
**Scene A — product:** FlowGuard Lab reproduces fixture FAIL vs PASS; agent explains PR risk honestly.
**Scene B — event compliance:** GitHub PR modifies FlowGuard, Vercel deploy Ready, TestSprite bot tests FlowGuard and posts check. These are different claims and both must be shown.

## Pre-submission evidence manifest
- `EVD-01`: public repository URL + meaningful commit history.
- `EVD-02`: production URL and PR-specific preview URL.
- `EVD-03`: TestSprite suite listing with executed runs, not only planned suite.
- `EVD-04`: actual GitHub PR link with TestSprite comment/check.
- `EVD-05`: screenshot/log from real failing assertion & correct fix on same PR (strongly recommended, not required to falsify).
- `EVD-06`: video optionally shows two scenes.

## Avoid predictable mistakes
- Triggering check before deployment ready -> all tests fail on unreachable preview.
- Testing production instead of PR preview -> tests give misleading confidence; verify target URL in bot report.
- Linking PR from unrelated repo -> does not prove FlowGuard integration.
- Marking PR compliant after only creating a TestSprite project or planning tests -> invalid evidence.

## Official resources
- https://www.testsprite.com/hackathon-s4
- https://docs.testsprite.com/web-portal/integrations/github-integration
- https://www.testsprite.com/use-cases/en/how-to-test-vercel-preview-deployments
