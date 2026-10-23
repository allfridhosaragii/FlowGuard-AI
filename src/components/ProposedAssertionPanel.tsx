'use client';

import { useState } from 'react';
import type { VerificationPlan } from '@/lib/schemas/agent-schemas';
import { buildProposedAssertion } from '@/lib/verification/proposed-assertions';

export function ProposedAssertionPanel({ plans }: { plans: VerificationPlan[] }) {
  const compatiblePlan = plans.find(
    (plan) =>
      (plan.testType === 'IDEMPOTENCY_CONCURRENCY' && plan.supportState === 'SUPPORTED') ||
      (plan.testType === 'AUTH_STATE' && plan.supportState === 'UNSUPPORTED')
  );
  const suggestion = buildProposedAssertion(compatiblePlan);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  if (!suggestion) return null;

  const handleCopy = async () => {
    setCopyFailed(false);
    setCopied(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API not available');
      await navigator.clipboard.writeText(suggestion.code);
      setCopied(true);
      return;
    } catch {
      let textarea: HTMLTextAreaElement | null = null;
      try {
        textarea = document.createElement('textarea');
        textarea.value = suggestion.code;
        textarea.readOnly = true;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        if (document.execCommand('copy')) {
          setCopied(true);
          return;
        }
      } catch {
        // The button must not report success if clipboard access fails.
      } finally {
        textarea?.remove();
      }
    }
    setCopyFailed(true);
  };

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4" aria-label="Example Assertion">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Example Assertion</h3>
          <p className="text-[11px] text-muted">
            {suggestion.isExecutableFixtureTest
              ? 'Runnable first-party fixture reproduction — not executed by this analysis'
              : 'Proposed verification template — unsupported, intentionally skipped'}
          </p>
        </div>
        <button
          type="button"
          data-testid="analysis-copy-assertion"
          aria-label={copied ? 'Assertion copied to clipboard' : 'Copy Example Assertion'}
          onClick={handleCopy}
          className="min-h-[44px] rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copied ? 'Copied' : 'Copy Assertion'}
        </button>
      </div>
      {copied && <p role="status" className="text-xs text-success">Example assertion copied to clipboard.</p>}
      {copyFailed && <p role="alert" className="text-xs text-danger">Copy failed. Select the code below to copy it manually.</p>}
      <pre data-testid="analysis-example-assertion" className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 text-xs text-foreground">{suggestion.code}</pre>
      <p data-testid="analysis-assertion-scope" className="text-[11px] leading-relaxed text-muted">
        <strong>Execution scope:</strong> {suggestion.scopeNote}
      </p>
    </section>
  );
}
