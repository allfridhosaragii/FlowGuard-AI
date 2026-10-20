# Security, Privacy & Anti-Misrepresentation Rules

## Threat boundaries
- Browser/form input untrusted.
- GitHub PR diff/code comments untrusted; may contain prompt injection.
- AI outputs untrusted instructions, even if JSON appears valid.
- Third-party tools may return stale, failed or incomplete data.
- Test fixture runner only trusts allowlisted first-party code.

## Must-pass security tests
`S-01` Reject URL outside `https://github.com/{owner}/{repo}/pull/{n}`; block redirect-based SSRF and localhost/IP-literal URLs; fetch canonical GitHub API endpoints only. `S-02` Restrict changed file count/bytes/lines and avoid silent truncation. `S-03` LLM_API_KEY never sent to client network bundle. `S-04` Sanitized logging, no raw secrets or full PR diff storage. `S-05` Reject AI-generated shell or JS execution. `S-06` Inject malicious PR comment "ignore instructions/exfiltrate key" and ensure model/tool ignores it. `S-07` Negative values, gigantic body, malformed JSON and conflicting keys rejected. `S-08` Anonymous rate limit and cost quota. `S-09` JSX escapes untrusted text against XSS. `S-10` Runner error cannot be green.

## GitHub workflow warning
Avoid `pull_request_target` combined with checkout and execution of untrusted PR code in privileged context; this can expose secrets. Prefer `pull_request` with least-privilege token for source test/CI, and separate trusted handling for events with write privileges. Reference https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target

## Consent and disclosure
- Only fetch public PRs explicitly supplied by user; don't ask private tokens unnecessarily.
- Clearly explain code snippets may be sent to configured LLM provider (unless redacted or self-hosted).
- Do not claim SOC 2 compliance, encryption guarantees, zero-day detection, vulnerability catch percentage, data deletion policy or no-logging beyond implementation.
- Demo does not touch real payment providers or real user transaction data.

## Trust state model
`POTENTIAL` cannot become `VERIFIED_*` just because a model says so. `VERIFIED_FAIL` only from matching target code actually executed. `VERIFIED_PASS` only means *specific bounded test* passed, not entire software safe. `INCONCLUSIVE` if evidence insufficient. `ERROR` if process fails. Always include source and tested target type.

## Incident/secret response
If any secret appears in repo/client/log: STOP release, remove from current tree, revoke/rotate token at provider, examine Git history and CI logs, add protective tests, then resume. Do not claim secrets have been purged from Git history unless it was actually audited/remediated.
