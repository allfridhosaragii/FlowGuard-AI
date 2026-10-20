# UX and Visual Quality Gate (TestSprite-ready)

Tests labeled *planned*: these are acceptance criteria, NOT executed results.

| ID | Scenario | Pass requirement |
|---|---|---|
| UX-01 | Home 375px | Hero + primary CTA visible, no body overflow |
| UX-02 | Navigation | All links lead to real pages |
| UX-03 | Lab user input | Parameter changes reflected in executor input and evidence |
| UX-04 | Lab side-by-side | `vulnerable` vs `fixed` show correct outcome from test runner |
| UX-05 | Copy evidence | Clipboard receives sanitized report, toast only after success |
| UX-06 | Invalid lab input | Error adjacent field, no test launch |
| UX-07 | PR invalid URL | Inline error, input retained |
| UX-08 | PR unsupported scope | Explicit refusal, no fake partial evidence |
| UX-09 | AI provider offline | Error and no bogus findings |
| UX-10 | Keyboard-only | Reach all critical buttons, modal close works |
| UX-11 | Reduced motion | No forced effects violating user setting |
| UX-12 | Mobile 320px | No page scroll-x; code has internal scroll |
| UX-13 | Color states | PASS/FAIL/POTENTIAL readable without color |
| UX-14 | TestSprite E2E | Site passes PR-deployed test suite and real GitHub check is visible |
| UX-15 | Evidence provenance | Scope + SHA/fixture + runner version shown |
| UX-16 | Loading state | Real in-flight indicator and disabled repeat submission |

## Execution rule

Each actual run should record test ID, timestamp, branch/SHA, URL, expected, observed, PASS/FAIL, artifact. Never check off solely because a model says done.
