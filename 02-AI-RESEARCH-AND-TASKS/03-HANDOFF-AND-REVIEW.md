# Independent Handoff & Review Protocol

## Before accepting any agent output

1. Verify target branch and SHA actually exist; inspect diff, not just summary.
2. Ensure file paths match assigned ownership and no destructive changes are hidden.
3. Run unit test + typecheck + production build on clean checkout; collect output.
4. Reproduce the claimed bug using identical input and a new isolated test run.
5. Check safety: no secrets committed, no `eval`/arbitrary shell from AI prompts, no hardcoded verdicts.
6. Verify mobile flow, click paths, accessible errors, source provenance.
7. Review failure cases and negative controls, especially no false `VERIFIED`.
8. Require TestSprite portal evidence on GitHub PR for hackathon claim.

## Role separation

- Implementer authors patch; another family reviews; deterministic tests decide observed behavior.
- Critical bug assertions additionally receive manual review. Blind agreement between two AI models is not evidence.
- The reviewer can reject with reproducible reproduction steps, not subjective phrases alone.

## Review labels

`APPROVE` = criteria + tests met; `CHANGES_REQUESTED` = blocking documented defect; `NEEDS_EVIDENCE` = claim without runnable proof; `OUT_OF_SCOPE` = not P0; `BLOCKED` = external dependency.

## PR comment template

```md
## FlowGuard review
**Scope / SHA:**
**Claimed improvement:**
**What was independently run:**
**Results (exit codes, test case IDs):**
**Risks, severity and evidence:**
**Required changes:**
**Verdict:** APPROVE | CHANGES_REQUESTED | NEEDS_EVIDENCE
```

## Dispute resolution

When two agents disagree, run a controlled reproducer and inspect acceptance criteria. If no reproducible evidence, keep issue `POTENTIAL` and defer non-blocking speculative changes.
