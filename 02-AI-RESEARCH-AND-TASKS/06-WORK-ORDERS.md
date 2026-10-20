# Work Orders — What to Delegate, In Which Order

## WO-001 Design UX (Gemini)

Source: `01-DESIGN`. Target: `/`, `/lab`, `/analyze`, `/about`. Block until typed API from integrator or use explicitly labeled mock adapters. Evidence: mobile screenshots, accessible tests.

## WO-002 Architecture & API (GPT)

Target: schema and state machines; public GitHub PR read-only fetch; error handling. Evidence: Zod validation tests and API integration logs.

## WO-003 Concurrency Fixture (Qwen or DeepSeek)

Target: synthetic duplicate-refund vulnerable/fixed lab with reproducible side effects, same-input compare. Evidence: `Vitest` real runner output and logs, no production payment.

## WO-004 Risk Audit (Claude + Kimi)

Target: invariants, non-bug safe controls, flawed test oracles, README truthfulness, cross-file drift. Evidence: source SHA/path/line + runnable counterexample.

## WO-005 Robustness Red Team (Z.ai/GLM)

Target: malformed structured outputs, timeouts, prompt injection, missing secret/keys, false positive controls. Evidence: fail-safe `ERROR/INCONCLUSIVE` on injected failures.

## WO-006 Integration / Release (one integrator; suggested GPT)

Target: typed union of lab/API/UI; Vercel preview, TestSprite suite regeneration, GitHub App PR check. Evidence: actual PR check URL and TestSprite result, no claim based on local console only.

## Timing gates

T0 controlled lab real test works; T1 PR fetch + AI schema works; T2 desktop/mobile UI with trust taxonomy; T3 independent review and negative controls; T4 PR TestSprite green; T5 submission docs. If T0/T4 not complete, drop optional features, not evidence integrity.
