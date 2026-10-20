/**
 * FlowGuard AI Provider Layer
 * 
 * Supports OpenAI-compatible providers, Gemini, Groq, or an explicit
 * local rule-based heuristic parser when no API key is supplied.
 * 
 * Rule: NEVER fake LLM inference. If no key is set, explicitly declare
 * isRealModel: false and indicate heuristic engine.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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
      process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY
    );
  }

  public static getModelName(): string {
    return (
      process.env.LLM_MODEL ||
      (process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'gpt-4o-mini')
    );
  }

  public static async generateJSON(
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const apiKey =
      process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Offline fallback: explicit heuristic parser
      return {
        content: '',
        isRealModel: false,
        modelName: 'offline-heuristic-rule-engine',
      };
    }

    const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    const model = this.getModelName();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

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
        const errorText = await response.text();
        throw new Error(`LLM provider error (${response.status}): ${errorText}`);
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
      if (err.name === 'AbortError') {
        throw new Error('LLM provider request timed out (20s limit)');
      }
      throw err;
    }
  }
}
