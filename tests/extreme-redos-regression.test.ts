import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../src/lib/ai/provider';
import { RequirementAgent } from '../src/lib/agents/requirement-agent';
import { RiskHunterAgent } from '../src/lib/agents/risk-agent';

describe('CodeQL js/redos regression: bounded evidence masking', () => {
  afterEach(() => vi.restoreAllMocks());

  it('XBUG-29: handles many escaped characters in unterminated template text without exponential backtracking', async () => {
    vi.spyOn(AIProvider, 'isConfigured').mockReturnValue(false);
    const rule = RequirementAgent.fallbackInvariant('No duplicate payment refunds');
    const escapedSequence = '\\_'.repeat(1000);
    const snippet = 'const simulated = `' + escapedSequence + '\n';
    const start = performance.now();
    const result = await RiskHunterAgent.analyze([rule], snippet, ['src/untrusted-text.ts']);
    expect(result.findings).toHaveLength(0);
    expect(performance.now() - start).toBeLessThan(1500);
  }, 5000);
});
