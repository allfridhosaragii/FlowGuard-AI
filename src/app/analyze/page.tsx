'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitPullRequest,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCode,
  FlaskConical,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { AnalysisResult } from '@/lib/schemas/agent-schemas';

export default function AnalysisWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'github' | 'snippet'>('snippet');
  const [githubPrUrl, setGithubPrUrl] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>(
`// Sample Vulnerable Concurrency Flow
async function processRefund(paymentId, idempotencyKey, amount) {
  // Read existing state without atomic lock
  const existing = await db.refunds.findOne({ idempotencyKey });
  if (existing) return existing;

  // Asynchronous gateway window
  await sleep(25);

  // Unprotected write side-effect
  const refund = await db.refunds.create({ paymentId, idempotencyKey, amount });
  await paymentGateway.issueRefund(paymentId, amount);
  return refund;
}`
  );
  const [businessRule, setBusinessRule] = useState<string>(
    'A settled payment can create at most one refund side effect for a given idempotency key, even with repeated requests.'
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeSnippetError, setCodeSnippetError] = useState<string | null>(null);
  const [githubPrError, setGithubPrError] = useState<string | null>(null);
  const [businessRuleError, setBusinessRuleError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    // Reset any previous analysis report and prior errors immediately
    setResult(null);
    setError(null);
    setCodeSnippetError(null);
    setGithubPrError(null);
    setBusinessRuleError(null);

    // Business rule validation
    if (!businessRule || businessRule.trim().length < 10) {
      setBusinessRuleError('Business rule must be at least 10 characters long.');
      setError('Validation Error: Business rule must be at least 10 characters.');
      return;
    }

    // Input mode validation
    if (activeTab === 'github') {
      if (!githubPrUrl || !githubPrUrl.trim()) {
        setGithubPrError('Please enter a valid public GitHub PR URL.');
        setError('Validation Error: GitHub PR URL is required.');
        return;
      }
    } else {
      if (!codeSnippet || !codeSnippet.trim()) {
        setCodeSnippetError('Code snippet is required and cannot be empty.');
        setError('Validation Error: Code snippet is required before launching multi-agent analysis.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        businessRule: businessRule.trim(),
      };

      if (activeTab === 'github') {
        payload.githubPrUrl = githubPrUrl.trim();
      } else {
        payload.codeSnippet = codeSnippet.trim();
        payload.filePaths = ['src/payment/refund-service.ts'];
      }

      const res = await fetch('/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Analysis request failed');
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis pipeline failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSamplePr = () => {
    setActiveTab('github');
    setGithubPrUrl('https://github.com/allfridhosaragii/FlowGuard-AI/pull/1');
  };

  const handleLoadPreset = (type: 'payment' | 'jwt' | 'clean') => {
    setActiveTab('snippet');
    if (type === 'payment') {
      setCodeSnippet(
`async function processRefund(paymentId, idempotencyKey, amount) {
  const existing = await db.refunds.findOne({ idempotencyKey });
  if (existing) return existing;
  await sleep(25); // Concurrency race window
  return await db.refunds.create({ paymentId, idempotencyKey, amount });
}`
      );
      setBusinessRule(
        'A settled payment can create at most one refund side effect for a given idempotency key, even under concurrent retries.'
      );
    } else if (type === 'jwt') {
      setCodeSnippet(
`export function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  // Vulnerable: permits "none" algorithm without signature
  const decoded = jwt.decode(token, { complete: true });
  if (decoded.header.alg === 'none') {
    req.user = decoded.payload;
    return next();
  }
}`
      );
      setBusinessRule(
        'All incoming API requests to privileged endpoints must require cryptographically verified token signatures and forbid the "none" algorithm.'
      );
    } else {
      setCodeSnippet(
`async function checkHealth(req, res) {
  const uptime = process.uptime();
  return res.json({ status: 'OK', uptime });
}`
      );
      setBusinessRule('Health check endpoint must report current process status without state mutations.');
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 max-w-[1160px] mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
          <GitPullRequest className="w-3.5 h-3.5" />
          Autonomous Multi-Agent Audit
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Pull Request & Code Analysis Workspace
        </h1>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Submit code changes alongside your business requirements. FlowGuard&apos;s three autonomous agents extract formal invariants, identify race-conditions or logic flaws, and synthesize verifiable test scenarios.
        </p>
      </div>

      {/* Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-border bg-surface space-y-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Source Input Mode
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('snippet')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  activeTab === 'snippet'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                Code Snippet
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('github')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  activeTab === 'github'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                Public GitHub PR
              </button>
            </div>
          </div>

          {/* Tab 1: GitHub URL */}
          {activeTab === 'github' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Public GitHub PR URL</span>
                <span className="text-[10px] text-muted">Required</span>
              </label>
              <input
                type="url"
                value={githubPrUrl}
                onChange={(e) => {
                  setGithubPrUrl(e.target.value);
                  if (githubPrError && e.target.value.trim()) setGithubPrError(null);
                }}
                placeholder="https://github.com/owner/repo/pull/123"
                className={`w-full px-3 py-2 rounded-md border text-xs font-mono text-foreground focus:outline-none transition-colors ${
                  githubPrError
                    ? 'border-danger bg-danger/5 focus:border-danger'
                    : 'border-border bg-surface-muted/30 focus:border-accent'
                }`}
              />
              {githubPrError && (
                <p className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{githubPrError}</span>
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Read-only fetch. Max 100KB diff, &le;20 files.</span>
                <button
                  type="button"
                  onClick={handleLoadSamplePr}
                  className="text-accent hover:underline font-medium"
                >
                  Load Sample PR #1
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Code Snippet */}
          {activeTab === 'snippet' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Target Code / Diff Snippet
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('payment')}
                    className="text-accent hover:underline"
                  >
                    Payment Race
                  </button>
                  <span className="text-muted">•</span>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('jwt')}
                    className="text-accent hover:underline"
                  >
                    JWT Leak
                  </button>
                  <span className="text-muted">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSnippet('');
                      setCodeSnippetError(null);
                      setResult(null);
                    }}
                    className="text-muted hover:text-danger hover:underline"
                  >
                    Clear Code
                  </button>
                </div>
              </div>
              <textarea
                rows={9}
                value={codeSnippet}
                onChange={(e) => {
                  setCodeSnippet(e.target.value);
                  if (codeSnippetError && e.target.value.trim()) setCodeSnippetError(null);
                }}
                className={`w-full p-3 rounded-md border text-xs font-mono text-foreground focus:outline-none resize-none leading-relaxed transition-colors ${
                  codeSnippetError
                    ? 'border-danger bg-danger/5 focus:border-danger'
                    : 'border-border bg-background focus:border-accent'
                }`}
                placeholder="Paste code or diff here..."
              />
              {codeSnippetError && (
                <p className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{codeSnippetError}</span>
                </p>
              )}
            </div>
          )}

          {/* Business Rule Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Business Rule to Verify</span>
              <span className="text-[10px] text-muted">10–2,000 chars</span>
            </label>
            <textarea
              rows={3}
              value={businessRule}
              onChange={(e) => {
                setBusinessRule(e.target.value);
                if (businessRuleError && e.target.value.trim().length >= 10) setBusinessRuleError(null);
              }}
              className={`w-full p-2.5 rounded-md border text-xs text-foreground focus:outline-none resize-none leading-relaxed transition-colors ${
                businessRuleError
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-surface-muted/30 focus:border-accent'
              }`}
              placeholder="State the invariant that must hold true (e.g. at most 1 refund per payment)..."
            />
            {businessRuleError && (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{businessRuleError}</span>
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleRunAnalysis}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-subtle text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agents Auditing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Launch Multi-Agent Analysis</span>
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

        {/* Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="p-12 rounded-xl border border-dashed border-border bg-surface-muted/20 text-center space-y-3">
              <GitPullRequest className="w-10 h-10 text-muted mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-sm text-foreground">Analysis Engine Ready</h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Provide a GitHub PR or code snippet with your business rule and click <strong>&quot;Launch Multi-Agent Analysis&quot;</strong> to begin.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-surface space-y-6 shadow-subtle">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-muted block">
                    Run ID: {result.runId}
                  </span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={result.verdict} size="md" />
                    <span className="text-xs font-semibold text-foreground">
                      Source: {result.sourceType === 'GITHUB_PR' ? 'GitHub PR' : 'Code Input'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-muted block">Inference Engine</span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {result.modelUsed}
                  </span>
                </div>
              </div>

              {/* Multi-Agent Execution Traces */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Multi-Agent Pipeline Progression
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {result.stages.map((st, i) => (
                    <div
                      key={i}
                      className="p-2 rounded border border-border bg-surface-muted/40 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate max-w-[120px]">
                          {st.agentName.replace(/Agent [ABC] \((.*)\)/, '$1')}
                        </span>
                        <span className="text-muted text-[10px]">{st.durationMs}ms</span>
                      </div>
                      <span className="text-[10px] text-muted block truncate">{st.summary}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Invariants (Agent A) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Formal Invariants Extracted (Agent A)
                </h3>
                {result.invariants.map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-lg bg-surface-muted/60 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-accent">{inv.id}</span>
                      <span className="text-[11px] text-muted font-medium">{inv.scope}</span>
                    </div>
                    <p className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border/80">
                      Predicate: {inv.predicate}
                    </p>
                    {inv.assumptions.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] text-muted space-y-0.5">
                        {inv.assumptions.map((asm, idx) => (
                          <li key={idx}>{asm}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Risk Findings (Agent B) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Identified Risk Findings (Agent B)
                </h3>
                {result.findings.length === 0 ? (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-xs text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No logical regression or invariant violations detected in the provided code.</span>
                  </div>
                ) : (
                  result.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 rounded-lg bg-surface-muted/60 border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger/10 text-danger border border-danger/25">
                            {finding.severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-foreground">
                            {finding.id}
                          </span>
                        </div>
                        <StatusBadge status={finding.status} size="sm" />
                      </div>

                      <p className="text-xs text-foreground leading-relaxed">
                        {finding.why}
                      </p>

                      <div className="p-2.5 rounded bg-background border border-border/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                          Counterexample Scenario:
                        </span>
                        <p className="text-xs font-mono text-muted leading-relaxed">
                          {finding.counterexample}
                        </p>
                      </div>

                      <div className="text-[11px] text-muted flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Paths: {finding.sourcePaths.join(', ')} ({finding.sourceLineRefs.join(', ')})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Verification Plans (Agent C) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Verification Action Plans (Agent C)
                </h3>
                {result.plans.map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border bg-surface-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-accent">
                          {plan.testType}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent/10 text-accent font-semibold">
                          {plan.supportState}
                        </span>
                      </div>
                      <p className="text-xs text-muted max-w-md">
                        {plan.expectedEffects}
                      </p>
                      <span className="text-[10px] text-muted/80 block">
                        Scope: Executes against first-party reference state machine to benchmark invariant behavior.
                      </span>
                    </div>

                    {plan.supportState === 'SUPPORTED' && (
                      <Link
                        href="/lab"
                        className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Verify In Lab (Fixture)</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes & Guarantees */}
              <div className="p-3 rounded-lg bg-surface-muted/60 border border-border/80 text-[11px] text-muted space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>Transparency & Operational Scope</span>
                </div>
                {result.notes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
