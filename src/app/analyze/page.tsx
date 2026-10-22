'use client';

import React, { useState, useRef } from 'react';
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
  SplitSquareHorizontal,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { AnalysisResult } from '@/lib/schemas/agent-schemas';
import { detectDomain } from '@/lib/agents/requirement-agent';

export default function AnalysisWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'github' | 'snippet'>('snippet');
  const [githubPrUrl, setGithubPrUrl] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [businessRule, setBusinessRule] = useState<string>(
    'A settled payment can create at most one refund side effect for a given idempotency key, even with repeated requests.'
  );

  const [presetActive, setPresetActive] = useState<'payment' | 'jwt' | 'clean' | null>(null);
  const [isUserEditedRule, setIsUserEditedRule] = useState<boolean>(false);

  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeSnippetError, setCodeSnippetError] = useState<string | null>(null);
  const [githubPrError, setGithubPrError] = useState<string | null>(null);
  const [businessRuleError, setBusinessRuleError] = useState<string | null>(null);

  // Domain compatibility notice between code and business rule
  const codeDomain = detectDomain(codeSnippet);
  const ruleDomain = detectDomain(businessRule);
  const domainMismatchWarning =
    codeSnippet.trim().length > 0 &&
    businessRule.trim().length > 0 &&
    codeDomain === 'arithmetic' &&
    (ruleDomain === 'auth' || ruleDomain === 'payment')
      ? `Domain Notice: Business rule specifies ${ruleDomain.toUpperCase()} domain constraints, but the target code is pure arithmetic. FlowGuard will enforce general pure-function invariants.`
      : null;

  const invalidateActiveAnalysis = () => {
    activeRequestIdRef.current++;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    setResult(null);
  };

  const handleRunAnalysis = async () => {
    // Reset prior reports and errors immediately on new run attempt
    setResult(null);
    setError(null);
    setCodeSnippetError(null);
    setGithubPrError(null);
    setBusinessRuleError(null);

    // Validate inputs comprehensively so all appropriate errors appear
    let hasValidationError = false;

    if (!businessRule || businessRule.trim().length < 10) {
      setBusinessRuleError('Business rule must be at least 10 characters long.');
      hasValidationError = true;
    }

    if (activeTab === 'github') {
      if (!githubPrUrl || !githubPrUrl.trim()) {
        setGithubPrError('Please enter a valid public GitHub PR URL.');
        hasValidationError = true;
      }
    } else {
      if (!codeSnippet || !codeSnippet.trim()) {
        setCodeSnippetError('Code snippet is required and cannot be empty.');
        hasValidationError = true;
      }
    }

    if (hasValidationError) {
      setError(
        !businessRule || businessRule.trim().length < 10
          ? 'Business rule must be at least 10 characters long.'
          : activeTab === 'github'
          ? 'GitHub PR URL is required.'
          : 'Code snippet is required and cannot be empty.'
      );
      return;
    }

    // Cancel in-flight request to prevent async race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++activeRequestIdRef.current;

    setLoading(true);
    try {
      const payload: {
        businessRule: string;
        githubPrUrl?: string;
        codeSnippet?: string;
        filePaths?: string[];
      } = {
        businessRule: businessRule.trim(),
      };

      if (activeTab === 'github') {
        payload.githubPrUrl = githubPrUrl.trim();
      } else {
        payload.codeSnippet = codeSnippet.trim();
        // Dynamically infer relevant file path based on code domain
        const cDomain = detectDomain(codeSnippet);
        if (cDomain === 'auth') {
          payload.filePaths = ['src/auth/jwt-service.ts'];
        } else if (cDomain === 'payment') {
          payload.filePaths = ['src/payment/refund-service.ts'];
        } else if (cDomain === 'arithmetic') {
          payload.filePaths = ['src/math/arithmetic.ts'];
        } else {
          payload.filePaths = ['src/service.ts'];
        }
      }

      const res = await fetch('/api/v1/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Analysis request failed');
      }

      const data: AnalysisResult = await res.json();
      // Drop response if a newer request has already been triggered
      if (currentRequestId !== activeRequestIdRef.current) {
        return;
      }
      setResult(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Stale request aborted — do not show error
      }
      if (currentRequestId === activeRequestIdRef.current) {
        setError(err instanceof Error ? err.message : 'Analysis pipeline failed');
        setResult(null);
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleLoadSamplePr = () => {
    invalidateActiveAnalysis();
    setActiveTab('github');
    setGithubPrUrl('https://github.com/allfridhosaragii/FlowGuard-AI/pull/1');
    setBusinessRule(
      'A settled payment can create at most one refund side effect for a given idempotency key, even under concurrent retries.'
    );
    setPresetActive('payment');
    setIsUserEditedRule(false);
  };

  const handleLoadPreset = (type: 'payment' | 'jwt' | 'clean') => {
    invalidateActiveAnalysis();
    setActiveTab('snippet');
    setPresetActive(type);
    setIsUserEditedRule(false);
    setError(null);
    setCodeSnippetError(null);
    setBusinessRuleError(null);

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
`export function add(a: number, b: number): number {
  return a + b;
}`
      );
      setBusinessRule(
        'The add function must perform pure arithmetic addition of two numbers without external side effects or state mutations.'
      );
    }
  };

  const handleClearCode = () => {
    invalidateActiveAnalysis();
    setCodeSnippet('');
    setCodeSnippetError(null);
    setResult(null);
    // When clearing code, also clear the business rule if it came from a preset or default
    if (presetActive !== null || !isUserEditedRule) {
      setBusinessRule('');
      setPresetActive(null);
      setIsUserEditedRule(false);
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
                id="tab-code-snippet"
                role="tab"
                aria-selected={activeTab === 'snippet'}
                onClick={() => { invalidateActiveAnalysis(); setActiveTab('snippet'); }}
                className={`px-3 py-1.5 text-xs rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  activeTab === 'snippet'
                    ? 'bg-accent text-white font-semibold'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                Code Snippet
              </button>
              <button
                type="button"
                id="tab-github-pr"
                role="tab"
                aria-selected={activeTab === 'github'}
                onClick={() => { invalidateActiveAnalysis(); setActiveTab('github'); }}
                className={`px-3 py-1.5 text-xs rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  activeTab === 'github'
                    ? 'bg-accent text-white font-semibold'
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
              <label htmlFor="github-pr-url-input" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Public GitHub PR URL</span>
                <span className="text-[10px] text-muted">Required</span>
              </label>
              <input
                id="github-pr-url-input"
                name="githubPrUrl"
                type="url"
                aria-label="Public GitHub PR URL"
                value={githubPrUrl}
                onChange={(e) => {
                  invalidateActiveAnalysis();
                  setGithubPrUrl(e.target.value);
                  if (githubPrError && e.target.value.trim()) setGithubPrError(null);
                }}
                placeholder="https://github.com/owner/repo/pull/123"
                className={`w-full px-3 py-2 rounded-md border text-xs font-mono text-foreground focus-visible:ring-2 focus-visible:ring-accent transition-colors ${
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
                <span>Read-only fetch. Max 200 KB diff, partial analysis for large PRs.</span>
                <button
                  type="button"
                  id="btn-load-sample-pr"
                  onClick={handleLoadSamplePr}
                  className="text-accent hover:underline font-medium focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
                >
                  Load Sample PR #1
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Code Snippet */}
          {activeTab === 'snippet' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="code-snippet-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Target Code / Diff Snippet</span>
                  <span className="text-[10px] text-muted font-normal">(Required)</span>
                </label>
                {codeSnippet ? (
                  <button
                    type="button"
                    id="btn-clear-code"
                    data-testid="btn-clear-code"
                    aria-label="Clear code snippet input"
                    onClick={handleClearCode}
                    className="text-[11px] text-muted hover:text-danger hover:underline font-medium min-h-[36px] flex items-center px-1 rounded focus-visible:ring-2 focus-visible:ring-danger"
                  >
                    Clear Code
                  </button>
                ) : null}
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-surface-muted/30">
                <span className="text-[11px] text-muted font-medium">Load sample scenario:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    id="btn-preset-payment"
                    data-testid="btn-preset-payment"
                    aria-label="Load Payment Race sample scenario"
                    onClick={() => handleLoadPreset('payment')}
                    className="px-2.5 py-1.5 text-xs rounded border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors font-medium min-h-[36px] flex items-center focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Payment Race
                  </button>
                  <button
                    type="button"
                    id="btn-preset-jwt"
                    data-testid="btn-preset-jwt"
                    aria-label="Load JWT Leak sample scenario"
                    onClick={() => handleLoadPreset('jwt')}
                    className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-foreground hover:bg-surface-muted transition-colors font-medium min-h-[36px] flex items-center focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    JWT Leak
                  </button>
                  <button
                    type="button"
                    id="btn-preset-clean"
                    data-testid="btn-preset-clean"
                    aria-label="Load Clean Arithmetic sample scenario"
                    onClick={() => handleLoadPreset('clean')}
                    className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-foreground hover:bg-surface-muted transition-colors font-medium min-h-[36px] flex items-center focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Clean Arithmetic
                  </button>
                </div>
              </div>

              <textarea
                id="code-snippet-input"
                name="codeSnippet"
                rows={9}
                aria-label="Target Code or Diff Snippet"
                aria-required="true"
                aria-invalid={!!codeSnippetError}
                aria-describedby={codeSnippetError ? 'code-snippet-error' : undefined}
                value={codeSnippet}
                onChange={(e) => {
                  const val = e.target.value;
                  invalidateActiveAnalysis();
                  setCodeSnippet(val);
                  if (codeSnippetError && val.trim()) setCodeSnippetError(null);
                  if (val.trim() === '') {
                    if (!isUserEditedRule) {
                      setBusinessRule('');
                      setPresetActive(null);
                    }
                  } else {
                    if (!isUserEditedRule) {
                      const newDomain = detectDomain(val);
                      if (newDomain === 'arithmetic' && (businessRule === '' || detectDomain(businessRule) !== 'arithmetic')) {
                        setBusinessRule(
                          'The function must perform pure arithmetic computation without side effects or external mutations.'
                        );
                      } else if (newDomain === 'auth' && (businessRule === '' || detectDomain(businessRule) !== 'auth')) {
                        setBusinessRule(
                          'JWT token verification must strictly validate expiration, cryptographic signature, and enforce algorithm integrity without bypass.'
                        );
                      } else if (newDomain === 'payment' && (businessRule === '' || detectDomain(businessRule) !== 'payment')) {
                        setBusinessRule(
                          'A settled payment can create at most one refund side effect for a given idempotency key, even with repeated requests.'
                        );
                      }
                      setPresetActive(null);
                    }
                  }
                }}
                className={`w-full p-3 rounded-md border text-xs font-mono text-foreground focus-visible:ring-2 focus-visible:ring-accent resize-none leading-relaxed transition-colors ${
                  codeSnippetError
                    ? 'border-danger bg-danger/5 focus:border-danger'
                    : 'border-border bg-background focus:border-accent'
                }`}
                placeholder="Paste code or diff here, or click 'Payment Race' above to load a sample..."
              />
              {codeSnippetError && (
                <p
                  id="code-snippet-error"
                  role="alert"
                  data-testid="code-snippet-error"
                  className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{codeSnippetError}</span>
                </p>
              )}
            </div>
          )}

          {/* Business Rule Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="business-rule-input" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Business Rule to Verify</span>
              <span className="text-[10px] text-muted">10–2,000 chars</span>
            </label>
            <textarea
              id="business-rule-input"
              name="businessRule"
              rows={3}
              aria-label="Business Rule to Verify"
              aria-required="true"
              aria-invalid={!!businessRuleError}
              aria-describedby={businessRuleError ? 'business-rule-error' : undefined}
              value={businessRule}
              onChange={(e) => {
                invalidateActiveAnalysis();
                setBusinessRule(e.target.value);
                setIsUserEditedRule(true);
                if (businessRuleError && e.target.value.trim().length >= 10) setBusinessRuleError(null);
              }}
              className={`w-full p-2.5 rounded-md border text-xs text-foreground focus-visible:ring-2 focus-visible:ring-accent resize-none leading-relaxed transition-colors ${
                businessRuleError
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-surface-muted/30 focus:border-accent'
              }`}
              placeholder="State the invariant that must hold true (e.g. at most 1 refund per payment)..."
            />
            {businessRuleError && (
              <p
                id="business-rule-error"
                role="alert"
                data-testid="business-rule-error"
                className="text-[11px] text-danger font-medium flex items-center gap-1 mt-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{businessRuleError}</span>
              </p>
            )}
            {domainMismatchWarning && (
              <div
                role="note"
                data-testid="domain-mismatch-warning"
                className="p-2.5 rounded bg-warning/10 border border-warning/30 text-[11px] text-warning flex items-start gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{domainMismatchWarning}</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-1">
            <button
              type="button"
              id="btn-launch-analysis"
              data-testid="btn-launch-analysis"
              aria-label="Launch Multi-Agent Analysis"
              disabled={loading}
              onClick={handleRunAnalysis}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-subtle text-sm focus-visible:ring-2 focus-visible:ring-accent"
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
            <div
              role="alert"
              data-testid="analysis-error-banner"
              className="p-3 rounded-md bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2"
            >
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
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={result.verdict} size="md" />
                    <span className="text-xs font-semibold text-foreground">
                      Source: {result.sourceType === 'GITHUB_PR' ? 'GitHub PR' : 'Code Input'}
                    </span>
                    {result.notes.some((n) => n.startsWith('Partial Analysis:')) && (
                      <span
                        id="partial-analysis-badge"
                        data-testid="partial-analysis-badge"
                        title="Not all files in this PR were analysed — see Transparency section below"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning border border-warning/30"
                      >
                        <SplitSquareHorizontal className="w-3 h-3" />
                        Partial Analysis
                      </span>
                    )}
                  </div>
                  {result.sourceType === 'GITHUB_PR' && (
                    <div data-testid="pr-source-provenance" className="mt-3 space-y-1.5 rounded-md border border-border bg-surface-muted/40 p-3 text-xs">
                      <p className="font-semibold text-foreground">Selected PR URL:</p>
                      {result.selectedPrUrl ? (
                        <a
                          href={result.selectedPrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block break-all text-accent underline"
                          data-testid="pr-source-url"
                        >
                          {result.selectedPrUrl}
                        </a>
                      ) : (
                        <p className="text-warning">PR URL not recorded. Source provenance is unverified.</p>
                      )}
                      <p data-testid="pr-fetch-status" className="font-medium text-foreground">
                        Fetch status: {result.prFetchStatus === 'LIVE_FETCH'
                          ? 'Live fetch (GitHub API)'
                          : result.prFetchStatus === 'CACHED'
                          ? 'Cached'
                          : result.prFetchStatus === 'FALLBACK_USED'
                          ? 'Fallback used'
                          : 'Unverified'}
                      </p>
                      {result.prFetchStatus === 'LIVE_FETCH' && (
                        <p className="text-muted">PR metadata and diff fetched from the selected GitHub URL. No stored or sample content substituted.</p>
                      )}
                      {result.prFetchStatus === 'FALLBACK_USED' && (
                        <p className="text-warning">Fallback data was used. This report does not claim a live GitHub PR fetch.</p>
                      )}
                      <p className="break-all text-muted">PR head SHA: {result.sourceSha}</p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-muted block">Inference Engine</span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {result.modelUsed}
                  </span>
                </div>
              </div>

              {/* Domain Mismatch Warning Banner */}
              {result.notes.some((n) => n.startsWith('Domain Notice:')) && (
                <div
                  role="alert"
                  data-testid="domain-mismatch-banner"
                  className="p-3.5 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span>Domain Mismatch Notice</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed font-medium">
                    {result.notes.find((n) => n.startsWith('Domain Notice:'))}
                  </p>
                  <p className="text-[11px] text-muted">
                    Note: The specified business rule domain does not align with the target code snippet. FlowGuard evaluated appropriate safety invariants for the code context; the mismatched rule is NOT certified or verified.
                  </p>
                </div>
              )}

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
                        <span>
                          Paths: {finding.sourcePaths.join(', ')}
                          {finding.sourceLineRefs.length > 0 && ` (${finding.sourceLineRefs.join(', ')})`}
                        </span>
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
