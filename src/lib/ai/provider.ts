/**
 * FlowGuard AI Provider Layer
 * 
 * Supports:
 * 1. Google Gemini Native API (via GEMINI_API_KEY)
 * 2. OpenAI-compatible providers (OpenAI, Groq, DeepSeek, Ollama via OPENAI_API_KEY / LLM_API_KEY)
 * 3. Transparent Offline Heuristic Parser (when no API key is provided)
 * 
 * CRITICAL RULE: NEVER claim heuristic analysis is an AI/neural model.
 * If no key is configured, isRealModel MUST be false and modelName must reflect
 * deterministic offline rule evaluation.
 */

export interface LLMResponse {
  content: string;
  isRealModel: boolean;
  modelName: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIProvider {
  public static isConfigured(): boolean {
    return Boolean(
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.LLM_API_KEY
    );
  }

  public static getModelName(): string {
    if (process.env.LLM_MODEL) {
      return process.env.LLM_MODEL;
    }
    if (process.env.GEMINI_API_KEY) {
      return 'gemini-1.5-flash';
    }
    if (process.env.OPENAI_API_KEY || process.env.LLM_API_KEY) {
      return 'gpt-4o-mini';
    }
    return 'deterministic-heuristic-v1';
  }

  public static async generateJSON(
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

    // 1. Google Gemini Native API
    if (geminiKey) {
      return this.callGemini(geminiKey, systemPrompt, userPrompt);
    }

    // 2. OpenAI-compatible API
    if (openaiKey) {
      return this.callOpenAICompatible(openaiKey, systemPrompt, userPrompt);
    }

    // 3. Transparent Offline Heuristic Parser (no API key configured)
    return {
      content: '',
      isRealModel: false,
      modelName: 'deterministic-heuristic-v1',
    };
  }

  private static async callGemini(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const content =
        data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      return {
        content,
        isRealModel: true,
        modelName: `gemini/${model}`,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out after 20s');
      }
      throw err;
    }
  }

  private static async callOpenAICompatible(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`LLM provider error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';

      return {
        content,
        isRealModel: true,
        modelName: model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('LLM provider request timed out after 20s');
      }
      throw err;
    }
  }
}
