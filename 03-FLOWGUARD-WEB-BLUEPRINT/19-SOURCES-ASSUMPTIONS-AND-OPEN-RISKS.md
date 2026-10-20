# Sources, Assumptions, Research Confidence and Open Risks

## Primary official references (checked for this package)
1. TestSprite Hackathon Season 4: https://www.testsprite.com/hackathon-s4 — official scoring, submission PR+Discord, schedule, GitHub App requirement.
2. TestSprite Web Portal GitHub integration: https://docs.testsprite.com/web-portal/integrations/github-integration — portal suite prerequisite, deployment-ready GitHub event, PR trigger, bot results.
3. TestSprite Vercel Preview Deployment how-to: https://www.testsprite.com/use-cases/en/how-to-test-vercel-preview-deployments — preview event and PR reporting.
4. GitHub Actions security (`pull_request_target`): https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target — warns about untrusted PR checkout with elevated secrets.
5. GitHub REST PR: https://docs.github.com/en/rest/pulls/pulls — API for PR metadata/patch.
6. Stack Overflow Developer Survey 2025: https://survey.stackoverflow.co/2025/ — background developer frustration, not proof of FlowGuard adoption.

## Provenance from our own project (snapshot only)
- Repo: https://github.com/allfridhosaragii/FlowGuard-AI — checked before this pack against earlier source audit; may have changed by the time agent reads it.
- Deployment: https://flowguard-ai-smoky.vercel.app/ — last-known URL, revalidate before submission.
- Screenshots from user's TestSprite flow: project created, exploration completed, 23 test cases planned, not yet executed as of supplied screenshot.

## Statements NOT backed by evidence yet
- "FlowGuard catches 99.8% of vulnerabilities", "sub-120ms inference", "detects zero-days", "runs every PR automatically" (for FlowGuard as a product; TestSprite automation is separate), "multi-agent works" (current simulator), "can audit arbitrary private repos", "this will get Top 5".
- Model rankings from public social testing may not generalize to your setup. Research folder 02 is useful as hypothesis, not empirical guarantee.

## Live unknowns to validate during build
- GitHub repo state when coding begins, new PRs not in snapshot.
- Vercel account permissions and presence of preview deployment events.
- Provider model API key, available quota, supported structured JSON and server timeout settings.
- Current TestSprite project suite creation/verification, GitHub App installation authorization, preview trigger, account matching.
- Whether one-person remaining hours permit 3-stage LLM + all test gates; follow scope cuts proactively.

## Explicit update policy
Agent must mark an unverified item `ASSUMPTION` or `BLOCKED`, not silently promote it to fact. Cite real sources/links in README and avoid unsourced rankings or success percentages.
