import { createOpenAiClient, isOpenAiConfigured } from "@/lib/ai/openai-client";
import {
  generateLocalTaskHintResponse,
  generateLocalTopicTutorResponse,
  getDiagnosticSummarySystemPrompt,
  getRouteRecommendationSystemPrompt,
  getSolutionAnalysisSystemPrompt,
  getTaskHintSystemPrompt,
  getTopicTutorSystemPrompt,
  kazakhFallbackResponses,
} from "@/lib/ai/prompts";
import type {
  AnalyzeSolutionParams,
  AiResponse,
  GenerateDiagnosticSummaryParams,
  GenerateRouteRecommendationParams,
  GenerateTaskHintParams,
  GenerateTopicTutorParams,
} from "@/lib/ai/types";

/**
 * Main AI Service
 * Routes requests to OpenAI or local fallback based on configuration
 */

class AiService {
  private useOpenAi: boolean;

  constructor() {
    this.useOpenAi = isOpenAiConfigured();
  }

  /**
   * Generate topic tutor response
   */
  async generateTopicTutorResponse(
    params: GenerateTopicTutorParams
  ): Promise<AiResponse> {
    const {
      profile,
      topic,
      contents,
      chatHistory,
      userMessage,
    } = params;

    const systemPrompt = getTopicTutorSystemPrompt(
      profile,
      topic.title,
      profile.level || "beginner"
    );

    // Build context from topic contents
    const contextText = contents
      .map((c) => `[${c.content_type}] ${c.content_text}`)
      .join("\n\n");

    const fullUserMessage = `
Контекст (тақырыбы ақпараты):
${contextText}

---

Сұрау: ${userMessage}
`;

    if (!this.useOpenAi) {
      return {
        content: generateLocalTopicTutorResponse(
          topic.title,
          userMessage,
          profile.level || "beginner"
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    const client = createOpenAiClient();
    if (!client) {
      return {
        content: generateLocalTopicTutorResponse(
          topic.title,
          userMessage,
          profile.level || "beginner"
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const messages = chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      messages.push({ role: "user", content: fullUserMessage });

      return await client.callApi(systemPrompt, messages, 0.7, 1500);
    } catch (error) {
      console.error("Topic tutor generation error:", error);

      return {
        content: generateLocalTopicTutorResponse(
          topic.title,
          userMessage,
          profile.level || "beginner"
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate task hint
   */
  async generateTaskHint(params: GenerateTaskHintParams): Promise<AiResponse> {
    const {
      profile,
      task,
      hintLevel,
    } = params;

    const systemPrompt = getTaskHintSystemPrompt(
      profile,
      task.title,
      profile.level || "beginner"
    );

    const userPrompt = `
Тапсырма: ${task.title}

Тапсырма мәні:
${task.body}

Жауап түрі: ${task.answer_type}
Қиындығы: ${task.difficulty}

Кеңес деңгейі: ${hintLevel}/4 (1=қарапайым, 2=формула, 3=қадамдық, 4=ұқсас мысал)

Толық жауап беріңіз, тек кеңес.
`;

    if (!this.useOpenAi) {
      return {
        content: generateLocalTaskHintResponse(task.title, hintLevel),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    const client = createOpenAiClient();
    if (!client) {
      return {
        content: generateLocalTaskHintResponse(task.title, hintLevel),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await client.generateCompletion(systemPrompt, userPrompt);
    } catch (error) {
      console.error("Task hint generation error:", error);

      return {
        content: generateLocalTaskHintResponse(task.title, hintLevel),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze student solution
   */
  async analyzeSolution(params: AnalyzeSolutionParams): Promise<AiResponse> {
    const {
      profile,
      task,
      answerText,
    } = params;

    const systemPrompt = getSolutionAnalysisSystemPrompt(
      profile.level || "beginner"
    );

    const userPrompt = `
Тапсырма: ${task.title}
Жауап түрі: ${task.answer_type}

Дұрыс жауап: ${task.correct_answer || "белгісіз"}

Оқушының жауабы:
${answerText}

Төмендегіні талдаңыз JSON форматында:
{
  "formula_feedback": "Формула туралы пікір немесе null",
  "unit_feedback": "Бірліктер туралы пікір немесе null",
  "logic_feedback": "Логика туралы пікір немесе null",
  "final_answer_feedback": "Соңғы жауап туралы пікір",
  "overall_feedback": "Жалпы қорытынды баға",
  "score": 0-100
}
`;

    if (!this.useOpenAi) {
      return {
        content: kazakhFallbackResponses.solutionFeedback(task.answer_type),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    const client = createOpenAiClient();
    if (!client) {
      return {
        content: kazakhFallbackResponses.solutionFeedback(task.answer_type),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await client.generateCompletion(systemPrompt, userPrompt);
    } catch (error) {
      console.error("Solution analysis error:", error);

      return {
        content: kazakhFallbackResponses.solutionFeedback(task.answer_type),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate diagnostic summary
   */
  async generateDiagnosticSummary(
    params: GenerateDiagnosticSummaryParams
  ): Promise<AiResponse> {
    const {
      profile,
      diagnosticResult,
      gradeScores,
      weakTopics,
      strongTopics,
    } = params;

    const systemPrompt = getDiagnosticSummarySystemPrompt(
      profile.level || "beginner"
    );

    const scoresText = Object.entries(gradeScores)
      .map(([topic, scores]) => `${topic}: ${scores.correct}/${scores.total}`)
      .join(", ");

    const userPrompt = `
Оқушының диагностикалық нәтижесі:

Ағымдағы балл: ${diagnosticResult.grade_score}%

Тақырыпқа сәй сметтері:
${scoresText}

Күшті тақырыптар:
${strongTopics.join(", ")}

Кемсетулі тақырыптар:
${weakTopics.join(", ")}

Мәтін түрінде қорытындылап бәрі сөйле.
`;

    if (!this.useOpenAi) {
      return {
        content: kazakhFallbackResponses.diagnosticSummary(
          profile.level || "beginner",
          diagnosticResult.grade_score
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    const client = createOpenAiClient();
    if (!client) {
      return {
        content: kazakhFallbackResponses.diagnosticSummary(
          profile.level || "beginner",
          diagnosticResult.grade_score
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await client.generateCompletion(systemPrompt, userPrompt);
    } catch (error) {
      console.error("Diagnostic summary generation error:", error);

      return {
        content: kazakhFallbackResponses.diagnosticSummary(
          profile.level || "beginner",
          diagnosticResult.grade_score
        ),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate route recommendation
   */
  async generateRouteRecommendation(
    params: GenerateRouteRecommendationParams
  ): Promise<AiResponse> {
    const {
      profile,
      diagnosticResult,
      interests,
      topics,
    } = params;

    const systemPrompt = getRouteRecommendationSystemPrompt(
      profile.level || "beginner"
    );

    const topicsText = topics
      .slice(0, 10)
      .map((t) => `${t.title} (${t.grade}-сынып)`)
      .join(", ");

    const userPrompt = `
Оқушының профилі:
- Деңгейі: ${profile.level}
- Диагностикалық балл: ${diagnosticResult.grade_score}%
- Сүйіктері: ${interests.join(", ") || "белгісіз"}

Қолжетімді тақырыптар:
${topicsText}

Оқу маршрутын ұсыныңыз. Берудің төрт адам цөлік:
1. Күшті жақтарынан бастап
2. Кемсетулі жақтарына атыңыз
3. Қызықты тақырыптарын қосыңыз
4. Мотивациялық сөз айтыңыз
`;

    if (!this.useOpenAi) {
      return {
        content: kazakhFallbackResponses.routeRecommendation(),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    const client = createOpenAiClient();
    if (!client) {
      return {
        content: kazakhFallbackResponses.routeRecommendation(),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await client.generateCompletion(systemPrompt, userPrompt);
    } catch (error) {
      console.error("Route recommendation generation error:", error);

      return {
        content: kazakhFallbackResponses.routeRecommendation(),
        sourceType: "local",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const aiService = new AiService();

// Export helper to check if AI is configured
export function isAiConfigured(): boolean {
  return isOpenAiConfigured();
}
