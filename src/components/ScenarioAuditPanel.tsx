'use client';

import { useState } from 'react';
import type { ScenarioName, ScenarioAuditEvidence } from '@/lib/verification/scenario-runner';

export function ScenarioAuditPanel({ scenario }: { scenario: ScenarioName }) {
  const [evidence, setEvidence] = useState<ScenarioAuditEvidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const isDeadlock = scenario === 'sql-deadlock';
  const label = isDeadlock ? 'SQL Deadlock' : 'Normal Healthy Stream';

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setEvidence(null);
    setCopied(false);
    setCopyFailed(false);
    try {
      const response = await fetch('/api/v1/lab/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Scenario fixture execution failed (HTTP ' + response.status + ')');
      const data = (await response.json()) as ScenarioAuditEvidence;
      if (data.scenario !== scenario || data.scope !== 'FIRST_PARTY_SYNTHETIC_FIXTURE') {
        throw new Error('Audit evidence did not match the selected scenario');
      }
      setEvidence(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to complete scenario audit');
    } finally {
      setLoading(false);
    }
  };


  const copyAssertion = async () => {
    if (!evidence?.runnableAssertion) return;
    const assertion = evidence.runnableAssertion;

    // Prefer the secure Clipboard API. Fall back for browser contexts where
    // clipboard permissions are restricted (including some test runners).
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(assertion);
      setCopied(true);
      setCopyFailed(false);
      return;
    } catch {
      let textarea: HTMLTextAreaElement | null = null;
      try {
        textarea = document.createElement('textarea');
        textarea.value = assertion;
        textarea.readOnly = true;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        if (document.execCommand('copy')) {
          setCopied(true);
          setCopyFailed(false);
          return;
        }
      } catch {
        // Failed fallback must never be reported as a successful copy.
      } finally {
        textarea?.remove();
      }
    }
    setCopied(false);
    setCopyFailed(true);
  };

  return (
    <section className="max-w-[1160px] mx-auto px-4 sm:px-6 pb-12 space-y-6" aria-label="Risk Simulator">
      <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">Risk Simulator / First-party synthetic fixture</p>
        <h2 className="text-xl font-bold text-foreground">{label} Preset</h2>
        <p className="text-sm text-muted">
          {isDeadlock
            ? 'Run two asynchronous synthetic transactions that acquire locks in opposite orders. The harness detects a circular wait-for dependency; it does not connect to SQL.'
            : 'Run three bounded asynchronous synthetic stream events and check for duplicates, missing events, and sequence disorder.'}
        </p>
        <p className="text-xs text-muted">
          The displayed findings come from the executed first-party simulation, not from a neural model or an external repository.
        </p>
        <button
          type="button"
          onClick={runAudit}
          disabled={loading}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-accent hover:bg-accent-hover px-6 py-3 font-semibold text-sm text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isDeadlock ? 'Run SQL deadlock audit' : 'Run healthy stream audit'}
        >
          {loading ? 'Running Scenario Audit...' : isDeadlock ? 'Run SQL Deadlock Audit' : 'Run Healthy Stream Audit'}
        </button>
        {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      </div>

      {!evidence && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          <div className="space-y-3 text-left" data-testid="scenario-trace-preview">
            <h3 className="font-bold text-foreground">Trace Preview — {label}</h3>
            <p className="text-warning font-medium">NOT EXECUTED. This is a fixture description, not observed evidence.</p>
            {isDeadlock ? (
              <p>Potential lock trace: TX_A requests payments then ledger; TX_B requests ledger then payments. Click Run SQL Deadlock Audit to observe the actual wait-for cycle.</p>
            ) : (
              <p>Sample stream trace: evt-001, evt-002, evt-003. Click Run Healthy Stream Audit to measure accepted event order and detect anomalies.</p>
            )}
            <p>Scenario audit standing by. Execute the selected preset to produce real fixture evidence.</p>
          </div>
        </div>
      )}

      {evidence && (
        <div className="p-6 rounded-xl border border-border bg-surface space-y-5" data-testid="scenario-audit-results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">Audit Result — {label}</h3>
              <p className="text-xs font-mono text-muted">Run ID: {evidence.runId}</p>
            </div>
            <span className="text-xs font-bold rounded-md px-3 py-2 border border-border">
              {evidence.riskLevel === 'HIGH' ? 'HIGH RISK' : 'LOW RISK'} · {evidence.verdict}
            </span>
          </div>
          <p className="font-semibold text-foreground">{evidence.summary}</p>
          <p className="text-sm text-muted"><strong>Formal invariant:</strong> {evidence.invariant}</p>
          <div>
            <h4 className="font-bold text-sm mb-2">Observed Execution Evidence</h4>
            <ul className="list-disc pl-5 text-sm text-muted space-y-1">
              {evidence.observations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2">Risk Findings</h4>
            {evidence.findings.length === 0
              ? <p className="text-sm text-success">No Risk Detected — 0 findings in this sample.</p>
              : <ul className="list-disc pl-5 text-sm text-danger space-y-1">
                  {evidence.findings.map((item) => <li key={item}>{item}</li>)}
                </ul>}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2">Execution Timeline</h4>
            <ol className="space-y-2 text-sm text-muted">
              {evidence.timeline.map((event) => (
                <li key={event.step} className="border-l-2 border-border pl-3">
                  <strong>{event.actor}:</strong> {event.action}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-bold text-sm">TestSprite Runnable Assertion</h4>
              <button
                type="button"
                data-testid="scenario-copy-assertion"
                onClick={copyAssertion}
                aria-label={copied ? 'Assertion copied to clipboard' : 'Copy TestSprite Runnable Assertion'}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {copied ? 'Copied' : 'Copy Assertion'}
              </button>
            </div>
            {copied && <p role="status" className="mb-2 text-xs text-success">Assertion copied to clipboard.</p>}
            {copyFailed && <p role="alert" className="mb-2 text-xs text-danger">Copy failed. Select the assertion code and copy it manually.</p>}
            <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words bg-surface-muted border border-border rounded-lg p-4 overflow-auto">{evidence.runnableAssertion}</pre>
          </div>
          <p className="text-xs text-muted" data-testid="scenario-scope-limitation">
            <strong>Provenance & Scope Guarantee:</strong> {evidence.fixtureId}. {evidence.limitations}
          </p>
        </div>
      )}
    </section>
  );
}
