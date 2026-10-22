import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../src/lib/ai/provider';
import { RequirementAgent } from '../src/lib/agents/requirement-agent';
import { RiskHunterAgent } from '../src/lib/agents/risk-agent';

describe('Extreme Bug Hunt: heuristic risk precision under adversarial evidence', () => {
  afterEach(() => vi.restoreAllMocks());

  it('XBUG-21: quoted refund snippets are not executable business-logic risk evidence', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const invariant = RequirementAgent.fallbackInvariant(
      'Refund operations must be idempotent and avoid duplicated effects.'
    );
    const harmless = [
      'async function showDocumentation() {',
      '  const example = `await db.find(key); await sleep(20); await db.insertRefund(key, amount);`;',
      '  await new Promise(resolve => setTimeout(resolve, 20));',
      '  console.log("refund demonstration only");',
      '}',
    ].join('\n');
    const result = await RiskHunterAgent.analyze([invariant], harmless, ['src/docs-example.ts']);
    expect(result.findings).toHaveLength(0);
  });

  it('XBUG-22: actual unprotected check-then-refund remains a potential critical risk', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const snippet = [
      'async function refund(key, amount) {',
      '  const existing = await db.find(key);',
      '  if (!existing) {',
      '    await sleep(20);',
      '    await db.insertRefund(key, amount);',
      '  }',
      '}',
    ].join('\n');
    const invariant = RequirementAgent.fallbackInvariant('A payment refund must be idempotent.', snippet);
    const result = await RiskHunterAgent.analyze([invariant], snippet, ['src/refund.ts']);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].status).toBe('POTENTIAL');
    expect(result.findings[0].severity).toBe('CRITICAL');
  });

  it('XBUG-23: clearly dangerous unsigned JWT acceptance remains detectable', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const snippet = 'function validate(header) { if (header.alg === "none") return true; return false; }';
    const invariant = RequirementAgent.fallbackInvariant('JWT signatures must be verified.', snippet);
    const result = await RiskHunterAgent.analyze([invariant], snippet, ['src/auth.ts']);
    expect(result.findings.some(f => f.id === 'RISK-002' && f.status === 'POTENTIAL')).toBe(true);
  });
});
