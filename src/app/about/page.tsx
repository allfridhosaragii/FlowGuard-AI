import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Layers,
  Cpu,
  Lock,
  FlaskConical,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-[1160px] mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
          <Layers className="w-3.5 h-3.5" />
          System Architecture
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Architecture, Philosophy & Security Guarantees
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          FlowGuard AI was built from first principles for <strong>TestSprite Hackathon Season 4</strong>. Here is how our multi-agent architecture and verification engine work under the hood.
        </p>
      </div>

      {/* Principle 1: Evidence Precedes Verdicts */}
      <section className="p-8 rounded-xl border border-border bg-surface space-y-4 shadow-subtle">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Core Principle: Evidence Precedes Verdicts
        </h2>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          In traditional static AI reviewers, language models often output confident claims like &quot;Vulnerability Verified&quot; or &quot;Code is Secure&quot; based solely on token probability. In mission-critical software, this is dangerous hallucination.
        </p>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          FlowGuard enforces an uncompromising rule: <strong>an AI model can only suggest a POTENTIAL finding</strong>. A finding can only be designated as <strong>VERIFIED_PASS</strong> or <strong>VERIFIED_FAIL</strong> when the target state machine has been executed in our test harness under real concurrent conditions and the side effects have been physically counted.
        </p>
      </section>

      {/* Multi-Agent Orchestration Architecture */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Multi-Agent State Machine Pipeline
          </h2>
          <p className="text-xs text-muted">
            The lifecycle of an analysis run follows an explicit, audited sequence of transitions:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-border bg-surface space-y-3 shadow-subtle">
            <div className="w-8 h-8 rounded-md bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="font-bold text-sm text-foreground">Agent A: Requirement Analyst</h3>
            <p className="text-xs text-muted leading-relaxed">
              Accepts human business specifications and translates them into machine-verifiable mathematical invariants (e.g. <code className="text-accent font-mono text-[11px]">count(side_effects) &le; 1</code>).
            </p>
          </div>

          <div className="p-5 rounded-lg border border-border bg-surface space-y-3 shadow-subtle">
            <div className="w-8 h-8 rounded-md bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="font-bold text-sm text-foreground">Agent B: Risk Hunter</h3>
            <p className="text-xs text-muted leading-relaxed">
              Inspects source diffs specifically searching for race conditions, non-atomic database checks, and dirty read windows that could violate the extracted invariant.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-border bg-surface space-y-3 shadow-subtle">
            <div className="w-8 h-8 rounded-md bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="font-bold text-sm text-foreground">Agent C: Verification Planner</h3>
            <p className="text-xs text-muted leading-relaxed">
              Synthesizes concrete input vectors and runnable test specifications targeting discovered edge-cases, ready for execution in TestSprite 3.0.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Isolation Boundaries */}
      <section className="p-8 rounded-xl border border-border bg-surface space-y-4 shadow-subtle">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent" />
          Security Boundaries & Untrusted Input Isolation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">No Arbitrary Shell Execution</h4>
            <p>
              External GitHub repositories are treated as completely untrusted input. FlowGuard NEVER executes arbitrary repository code or shell commands on the application server. Tests are run solely against first-party allowlisted synthetic fixtures.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Read-Only GitHub REST Access</h4>
            <p>
              Pull requests are inspected strictly via read-only GitHub REST API calls without write privileges. Input sizes are bounded to 100 KB diff and 20 files to prevent denial-of-service and memory exhaustion.
            </p>
          </div>
        </div>
      </section>

      {/* TestSprite 3.0 Integration */}
      <section className="p-6 rounded-xl border border-accent/30 bg-accent/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            TestSprite Hackathon Season 4 Verification
          </h3>
          <p className="text-xs text-muted max-w-xl">
            FlowGuard AI connects directly to TestSprite 3.0 GitHub App to run automated PR checks and regression validation suites automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-subtle"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Open Lab</span>
          </Link>
          <a
            href="https://github.com/allfridhosaragii/FlowGuard-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-surface text-foreground border border-border text-xs font-semibold hover:bg-surface-muted transition-colors shadow-subtle"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    </div>
  );
}
