import type { AiResponse } from "@/lib/ai/types";

/**
 * OpenAI API Client
 * Handles communication with OpenAI API for AI features
 */

const OPENAI_BASE_URL = "https://api.openai.com/v1";

export class OpenAiClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Call OpenAI API with messages
   */
  async callApi(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7,
    maxTokens = 1000
  ): Promise<AiResponse> {
    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    try {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: allMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      const content =
        data.choices?.[0]?.message?.content || "No response from OpenAI";

      return {
        content,
        sourceType: "openai",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  /**
   * Generate a completion for a single prompt
   */
  async generateCompletion(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AiResponse> {
    return this.callApi(systemPrompt, [{ role: "user", content: userPrompt }]);
  }
}

/**
 * Factory function to create OpenAI client
 */
export function createOpenAiClient(
  apiKey?: string,
  model?: string
): OpenAiClient | null {
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (!key) {
    return null;
  }

  return new OpenAiClient(key, model || process.env.AI_MODEL || "gpt-4o-mini");
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
