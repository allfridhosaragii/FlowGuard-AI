'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { VerificationEvidence } from '@/lib/verification/evidence';

export default function VerificationLabPage() {
  const [fixture, setFixture] = useState<'vulnerable' | 'fixed'>('vulnerable');
  const [concurrency, setConcurrency] = useState<number>(2);
  const [paymentId, setPaymentId] = useState<string>('pay_demo_001');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('retry-token-881');
  const [amountMinor, setAmountMinor] = useState<number>(125000);
  const [payloadMode, setPayloadMode] = useState<'same_amount' | 'differing_amount'>('same_amount');

  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<VerificationEvidence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture,
          concurrency,
          paymentId,
          idempotencyKey,
          amountMinor,
          payloadMode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Verification harness request failed');
      }

      const data: VerificationEvidence = await res.json();
      setEvidence(data);
    } catch (err: any) {
      setError(err.message || 'Unexpected failure while running verification');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!evidence?.testSpriteAssertion) return;
    navigator.clipboard.writeText(evidence.testSpriteAssertion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-10 px-4 sm:px-6 max-w-[1160px] mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
          <FlaskConical className="w-3.5 h-3.5" />
          Deterministic Sandbox
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Controlled Verification Lab
        </h1>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Prove or disprove business invariants using real concurrent execution. The test harness runs parallel Node.js threads against synthetic financial state machines and collects tangible execution evidence.
        </p>
      </div>

      {/* Main Grid: Left Controls, Right Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-border bg-surface space-y-6 shadow-subtle">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Verification Parameters
            </h2>
            <p className="text-xs text-muted">
              Configure the execution environment and target fixture.
            </p>
          </div>

          {/* Fixture Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Target Implementation</span>
              <span className="text-[11px] text-muted font-normal">
                {fixture === 'vulnerable' ? 'Flawed race window' : 'Atomic mutex lock'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFixture('vulnerable')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  fixture === 'vulnerable'
                    ? 'border-danger/60 bg-danger/5 text-danger font-bold'
                    : 'border-border text-muted hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Vulnerable Fixture</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                  refund-vulnerable-v1
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFixture('fixed')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  fixture === 'fixed'
                    ? 'border-success/60 bg-success/5 text-success font-bold'
                    : 'border-border text-muted hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Corrected Fixture</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                  refund-fixed-v1
                </span>
              </button>
            </div>
          </div>

          {/* Concurrency Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Concurrent Parallel Requests</span>
              <span className="font-mono text-xs font-bold text-accent">{concurrency} Worker Threads</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConcurrency(lvl)}
                  className={`py-2 text-xs font-bold rounded-md border text-center transition-all ${
                    concurrency === lvl
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-muted hover:bg-surface-muted'
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted">
              {concurrency === 1
                ? 'Single request: race condition will NOT trigger.'
                : `${concurrency} requests dispatched simultaneously into the async state window.`}
            </p>
          </div>

          {/* Idempotency Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Idempotency Key</label>
            <input
              type="text"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-muted/30 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              placeholder="e.g. retry-token-881"
            />
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Amount (Minor Units)</label>
              <input
                type="number"
                value={amountMinor}
                onChange={(e) => setAmountMinor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-muted/30 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
              <span className="text-[10px] text-muted block">${(amountMinor / 100).toFixed(2)} USD</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Payload Mode</label>
              <select
                value={payloadMode}
                onChange={(e: any) => setPayloadMode(e.target.value)}
                className="w-full px-2.5 py-2 rounded-md border border-border bg-surface-muted/30 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="same_amount">Identical Amount</option>
                <option value="differing_amount">Conflicting Amount</option>
              </select>
            </div>
          </div>

          {/* Run Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleRunVerification}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-subtle text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Concurrent Threads...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Execute Verification Harness</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Evidence Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!evidence ? (
            <div className="p-12 rounded-xl border border-dashed border-border bg-surface-muted/20 text-center space-y-3">
              <FlaskConical className="w-10 h-10 text-muted mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-sm text-foreground">Harness Standing By</h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Configure parameters and click <strong>&quot;Execute Verification Harness&quot;</strong> to start concurrent threads and collect execution evidence.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-surface space-y-6 shadow-subtle">
              {/* Result Summary Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-muted block">
                    Execution Run ID: {evidence.runId}
                  </span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={evidence.verdict} size="md" />
                    <span className="text-xs font-semibold text-foreground">
                      Target: {evidence.targetId}
                    </span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                  <span className="text-xs text-muted">Harness Execution Time</span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {evidence.executionDurationMs} ms
                  </span>
                </div>
              </div>

              {/* Observed vs Invariant */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-surface-muted/50 border border-border">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted uppercase font-medium">Observed Side Effects</span>
                  <div className="text-xl font-bold font-mono">
                    <span
                      className={
                        evidence.observedEffects > 1 ? 'text-danger' : 'text-success'
                      }
                    >
                      {evidence.observedEffects}
                    </span>
                    <span className="text-xs text-muted font-normal"> committed refund(s)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted uppercase font-medium">
                    Formal Invariant Rule
                  </span>
                  <div className="text-xl font-bold font-mono text-foreground">
                    &le; 1{' '}
                    <span className="text-xs text-muted font-normal">
                      maximum allowed (INV-REFUND-001)
                    </span>
                  </div>
                </div>
              </div>

              {/* Invariant Explanation */}
              <div className="text-xs space-y-1 text-muted leading-relaxed">
                <p>
                  <strong>Evaluated Invariant:</strong> {evidence.invariantDescription}
                </p>
                {evidence.verdict === 'VERIFIED_FAIL' ? (
                  <p className="text-danger font-medium">
                    Violation Confirmed: Concurrent requests triggered duplicate database balance deduction before the idempotency record was committed.
                  </p>
                ) : (
                  <p className="text-success font-medium">
                    Invariant Upheld: Atomic reservation lock ensured only one refund was committed, regardless of concurrent duplicate attempts.
                  </p>
                )}
              </div>

              {/* Execution Timeline */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Harness Execution Timeline
                </h3>
                <div className="border border-border rounded-lg overflow-hidden bg-background text-xs font-mono">
                  <div className="max-h-48 overflow-y-auto divide-y divide-border">
                    {evidence.timeline.map((evt) => (
                      <div key={evt.step} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-[10px]">+{evt.timestampOffsetMs}ms</span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-muted text-[10px] text-accent font-semibold">
                            {evt.threadId}
                          </span>
                          <span className="text-foreground">{evt.action}</span>
                        </div>
                        {evt.resultStatus && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              evt.resultStatus === 'COMMITTED'
                                ? 'bg-success/10 text-success'
                                : 'bg-muted/10 text-muted'
                            }`}
                          >
                            {evt.resultStatus}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TestSprite 3.0 Generated Assertion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    TestSprite 3.0 Runnable Assertion
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Test'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-surface-muted text-[11px] font-mono text-foreground border border-border overflow-x-auto leading-relaxed">
                  {evidence.testSpriteAssertion}
                </pre>
              </div>

              {/* Scope Notice */}
              <div className="p-3 rounded-lg bg-surface-muted/60 border border-border/80 text-[11px] text-muted space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>Provenance & Scope Guarantee</span>
                </div>
                {evidence.notes.map((note, idx) => (
                  <p key={idx}>{note}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
