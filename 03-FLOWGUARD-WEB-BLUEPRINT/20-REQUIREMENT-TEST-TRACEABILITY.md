# Requirement → Code → Test → Evidence Traceability

| Feature | Expected component | Test ID | Evidence required |
|--|--|--|--|
| FG-F01 | Home/navigational routes | E2E-01 | CI screenshot/trace of actual CTA |
| FG-F02 | Lab form / Zod schema | UNIT-05, E2E-02 | enforced bounds & UI status |
| FG-F03 | Refund fixture engine | UNIT-01..06 | genuine observed counts vulnerable/fixed |
| FG-F04 | Evidence model/component | INT-01, E2E-02/03 | run ID+target+input+observed+time |
| FG-F05 | Business rule parser | API-A01 (create) | empty/long/valid rule tests |
| FG-F06 | GitHub PR fetch | INT-03/04/07 | actual PR metadata/diff provenance |
| FG-F07 | Agent orchestration | UNIT-07/08, INT-06 | actual provider call and schema validation |
| FG-F08 | Trust states | UNIT-07, SEC-TRUST01 | no PR `VERIFIED_*` without target run |
| FG-F09 | Error/loading | INT-02/03/06, E2E-04 | messages and no stale success |
| FG-F10 | Responsive UI | E2E-05/06 | 320–1440 widths, keyboard focus |
| FG-F11 | Vercel PR preview | CI-01, TS-02 | PR preview URL & deploy Ready |
| FG-F12 | TestSprite GitHub App | TS-01/03/04 | external run link/check tied to real PR |
| FG-F13 | Source honesty/README | DOC-01 | no fake stat; setup and limitations accurate |

**Create the undefined script/test IDs as actual tests, not just documentation.** Progress dashboard should link to test logs/commits, not arbitrary percentages. `P0 complete` requires every row evidenced, not simply having code paths.

## Cross-folder traceability
- UX details and visual snapshot: `../01-DESIGN/04-SCREEN-SPECS.md`, `07-UX-TEST-CASES.md`.
- Model role and error avoidance: `../02-AI-RESEARCH-AND-TASKS/MODEL-MISSIONS/`.
- Low-level API/SQL/LLM: `REFERENCE-TECHNICAL-BLUEPRINT/specs/` and `docs/`.
- Implementation task owner: `18-IMPLEMENTATION-TASK-BOARD.md`.
