import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../src/lib/ai/provider';

describe('Extreme Bug Hunt: public analysis AI cost safety', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('XBUG-26: accidentally configured API keys never trigger paid calls without explicit opt-in', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'synthetic-test-key-not-real');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('FLOWGUARD_ENABLE_NEURAL', 'false');
    const call = vi.fn(() => { throw new Error('A paid network call should never run'); });
    vi.stubGlobal('fetch', call);
    expect(AIProvider.isConfigured()).toBe(false);
    const result = await AIProvider.generateJSON('system prompt', 'untrusted PR content');
    expect(result.isRealModel).toBe(false);
    expect(result.modelName).toMatch(/heuristic/i);
    expect(call).not.toHaveBeenCalled();
  });

  it('XBUG-27: valid key is not sufficient without explicit neural activation', () => {
    vi.stubEnv('OPENAI_API_KEY', 'synthetic-test-key-not-real');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('FLOWGUARD_ENABLE_NEURAL', '');
    expect(AIProvider.isConfigured()).toBe(false);
    vi.stubEnv('FLOWGUARD_ENABLE_NEURAL', 'true');
    expect(AIProvider.isConfigured()).toBe(true);
  });
});
