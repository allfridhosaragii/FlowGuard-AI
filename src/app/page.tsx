import React from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Code2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 max-w-[1160px] mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-accent/10 text-accent border border-accent/25 max-w-full">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate sm:whitespace-normal">TestSprite Hackathon Season 4 Candidate</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Don&apos;t just review code.{' '}
          <span className="text-accent underline decoration-accent/30 underline-offset-8">
            Prove it works.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Traditional linters check syntax and types, but miss critical runtime regressions. FlowGuard AI audits code changes against formal business rules, detects concurrency flaws, and produces reproducible verification evidence.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/lab"
            id="cta-open-lab"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-subtle group focus-visible:ring-2 focus-visible:ring-accent"
          >
            <FlaskConical className="w-5 h-5 text-white/90" />
            <span>Open Verification Lab</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/analyze"
            id="cta-analyze-pr"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-surface text-foreground font-medium hover:bg-surface-muted border border-border transition-colors shadow-subtle focus-visible:ring-2 focus-visible:ring-accent"
          >
            <GitPullRequest className="w-5 h-5 text-accent" />
            <span>Analyze Pull Request</span>
          </Link>
        </div>

        <div className="pt-2 text-xs text-muted flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" /> No account required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" /> In-process deterministic execution
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" /> Evidence precedes verdicts
          </span>
        </div>
      </section>

      {/* The Core Problem & Comparison */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            The Gap Between Code Review & Reality
          </h2>
          <p className="text-sm text-muted">
            Code reviews frequently approve PRs that pass all static checks yet fail under concurrent production traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Linters Card */}
          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Conventional Static Review
              </span>
              <XCircle className="w-5 h-5 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              What Standard Tools Check
            </h3>
            <ul className="space-y-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">✕</span>
                <span>Validates TypeScript types and syntax structure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">✕</span>
                <span>Assumes async operations are isolated without verifying race conditions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">✕</span>
                <span>Cannot detect duplicate refund settlement when two requests arrive simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold">✕</span>
                <span>Outputs advisory comments without runnable verification harnesses.</span>
              </li>
            </ul>
          </div>

          {/* FlowGuard Card */}
          <div className="p-6 rounded-xl border border-accent/40 bg-accent/[0.02] space-y-4 shadow-subtle relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                FlowGuard AI Behavioral Verification
              </span>
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              What FlowGuard Actually Proves
            </h3>
            <ul className="space-y-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Extracts formal business invariants (e.g. at most 1 refund side effect per key).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Executes controlled concurrent requests against target state machines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Demonstrably catches race-conditions with exact observed commit counts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Produces executable TestSprite 3.0 test assertions automatically.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Overview */}
      <section className="p-8 rounded-2xl border border-border bg-surface space-y-8 shadow-subtle">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Multi-Agent Pipeline
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Three Specialized Stages, One Evidence Standard
          </h2>
          <p className="text-sm text-muted">
            FlowGuard divides responsibilities across three autonomous stages. No single stage can fabricate execution proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-border bg-surface-muted/50 space-y-3">
            <div className="w-8 h-8 rounded bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
              A
            </div>
            <h3 className="font-bold text-sm text-foreground">Requirement Analyst</h3>
            <p className="text-xs text-muted leading-relaxed">
              Extracts formal mathematical invariants, predicates, and domain assumptions from human business rules and PR descriptions.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-border bg-surface-muted/50 space-y-3">
            <div className="w-8 h-8 rounded bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
              B
            </div>
            <h3 className="font-bold text-sm text-foreground">Risk Hunter</h3>
            <p className="text-xs text-muted leading-relaxed">
              Audits the pull request diff for non-atomic operations, dirty reads, and race windows. All findings are strictly classified as POTENTIAL.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-border bg-surface-muted/50 space-y-3">
            <div className="w-8 h-8 rounded bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
              C
            </div>
            <h3 className="font-bold text-sm text-foreground">Verification Planner</h3>
            <p className="text-xs text-muted leading-relaxed">
              Maps potential vulnerabilities into concrete test input vectors, failure criteria, and executable TestSprite 3.0 assertions.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Invariant Banner */}
      <section className="p-6 rounded-xl border border-border bg-surface-muted/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Code2 className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono font-bold text-accent">INV-REFUND-001</span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            Payment Idempotency & Concurrency Race Condition Proof
          </h3>
          <p className="text-xs text-muted max-w-xl">
            Test the live verification harness right now. Compare the vulnerable implementation against the corrected atomic lock implementation.
          </p>
        </div>

        <Link
          href="/lab"
          className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-subtle"
        >
          <span>Run Lab Simulation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}
