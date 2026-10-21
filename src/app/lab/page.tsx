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
  const [idempotencyKeyError, setIdempotencyKeyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleRunVerification = async () => {
    // Clear stale evidence and prior errors immediately on submit
    setEvidence(null);
    setError(null);
    setIdempotencyKeyError(null);

    // Client-side validation: enforce non-empty Idempotency Key
    if (!idempotencyKey || !idempotencyKey.trim()) {
      setIdempotencyKeyError('Idempotency Key is required');
      setError('Idempotency Key is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/lab/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture,
          concurrency,
          paymentId: paymentId.trim(),
          idempotencyKey: idempotencyKey.trim(),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected failure while running verification');
      setEvidence(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!evidence?.testSpriteAssertion) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(evidence.testSpriteAssertion);
        setCopied(true);
        setCopyFailed(false);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      // Fallback using temporary textarea for environments where Clipboard API is restricted or headless
      try {
        const textarea = document.createElement('textarea');
        textarea.value = evidence.testSpriteAssertion;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          setCopied(true);
          setCopyFailed(false);
          setTimeout(() => setCopied(false), 2500);
          return;
        }
      } catch {
        // Fallback also failed
      }
      // Honestly disclose copy failure
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
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
          Prove or disprove business invariants using real concurrent execution. The test harness executes concurrent asynchronous requests against synthetic financial state machines via Promise.all and collects tangible execution evidence.
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
            <div className="grid grid-cols-2 gap-2" aria-label="Target Implementation Fixture">
              <button
                type="button"
                id="fixture-vulnerable"
                aria-pressed={fixture === 'vulnerable'}
                onClick={() => setFixture('vulnerable')}
                className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all focus-visible:ring-2 focus-visible:ring-danger ${
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
                id="fixture-fixed"
                aria-pressed={fixture === 'fixed'}
                onClick={() => setFixture('fixed')}
                className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all focus-visible:ring-2 focus-visible:ring-success ${
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
              <span className="font-mono text-xs font-bold text-accent">{concurrency} Async Requests</span>
            </label>
            <div className="grid grid-cols-5 gap-2" aria-label="Concurrent Parallel Requests Level">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  id={`concurrency-btn-${lvl}`}
                  aria-pressed={concurrency === lvl}
                  aria-label={`${lvl} concurrent asynchronous requests`}
                  onClick={() => setConcurrency(lvl)}
                  className={`min-h-[40px] py-2 text-xs font-bold rounded-md border text-center transition-all focus-visible:ring-2 focus-visible:ring-accent ${
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
            <div className="flex items-center justify-between">
              <label htmlFor="lab-idempotency-key" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Idempotency Key</span>
                <span className="text-[10px] text-muted font-normal">(Required)</span>
              </label>
              {idempotencyKey ? (
                <button
                  type="button"
                  id="btn-clear-idempotency-key"
                  onClick={() => {
                    setIdempotencyKey('');
                    setIdempotencyKeyError(null);
                  }}
                  className="text-[11px] text-accent hover:underline font-medium min-h-[36px] flex items-center px-1 rounded focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Clear Key
                </button>
              ) : null}
            </div>
            <input
              id="lab-idempotency-key"
              name="idempotencyKey"
              type="text"
              aria-label="Idempotency Key"
              aria-required="true"
              aria-invalid={!!idempotencyKeyError}
              aria-describedby={idempotencyKeyError ? 'lab-idempotency-key-error' : undefined}
              value={idempotencyKey}
              onChange={(e) => {
                setIdempotencyKey(e.target.value);
                if (idempotencyKeyError && e.target.value.trim()) {
                  setIdempotencyKeyError(null);
                }
              }}
              className={`w-full px-3 py-2 rounded-md border text-xs font-mono text-foreground focus-visible:ring-2 focus-visible:ring-accent transition-colors ${
                idempotencyKeyError
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-surface-muted/30 focus:border-accent'
              }`}
              placeholder="Enter unique idempotency key..."
            />
            {idempotencyKeyError && (
              <p
                id="lab-idempotency-key-error"
                role="alert"
                data-testid="lab-idempotency-key-error"
                className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{idempotencyKeyError}</span>
              </p>
            )}
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="lab-amount-input" className="text-xs font-semibold text-foreground">
                Amount (Minor Units)
              </label>
              <input
                id="lab-amount-input"
                name="amountMinor"
                type="number"
                aria-label="Amount in minor units"
                value={amountMinor}
                onChange={(e) => setAmountMinor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-muted/30 text-xs font-mono text-foreground focus-visible:ring-2 focus-visible:ring-accent focus:border-accent"
              />
              <span className="text-[10px] text-muted block">${(amountMinor / 100).toFixed(2)} USD</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lab-payload-mode" className="text-xs font-semibold text-foreground">
                Payload Mode
              </label>
              <select
                id="lab-payload-mode"
                name="payloadMode"
                aria-label="Payload Mode"
                value={payloadMode}
                onChange={(e) => setPayloadMode(e.target.value as 'same_amount' | 'differing_amount')}
                className="w-full px-2.5 py-2 rounded-md border border-border bg-surface-muted/30 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-accent focus:border-accent"
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
              id="btn-execute-verification"
              data-testid="btn-execute-verification"
              aria-label="Execute Verification Harness"
              disabled={loading}
              onClick={handleRunVerification}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-subtle text-sm focus-visible:ring-2 focus-visible:ring-accent"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Concurrent Async Requests...</span>
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
            <div
              role="alert"
              data-testid="lab-error-banner"
              className="p-3 rounded-md bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2"
            >
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
                Configure parameters and click <strong>&quot;Execute Verification Harness&quot;</strong> to dispatch concurrent asynchronous requests and collect execution evidence.
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
                    id="btn-copy-test-assertion"
                    data-testid="btn-copy-test-assertion"
                    onClick={handleCopyCode}
                    aria-label={copied ? 'Assertion copied to clipboard' : 'Copy test assertion'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all min-h-[36px] focus-visible:ring-2 focus-visible:ring-accent ${
                      copied
                        ? 'bg-success/15 text-success border border-success/30 font-bold'
                        : copyFailed
                        ? 'bg-danger/15 text-danger border border-danger/30 font-bold'
                        : 'text-accent hover:text-accent-hover bg-surface-muted/60 hover:bg-surface-muted border border-border/80'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success stroke-[2.5]" />
                        <span className="text-success">Copied</span>
                      </>
                    ) : copyFailed ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                        <span className="text-danger">Copy Failed</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Test</span>
                      </>
                    )}
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
