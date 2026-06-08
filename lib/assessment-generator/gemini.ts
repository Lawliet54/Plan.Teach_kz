import { GoogleGenAI } from "@google/genai";

import { buildAssessmentPrompt } from "@/lib/assessment-generator/prompt";
import { assessmentResponseSchema } from "@/lib/assessment-generator/schema";
import { normalizeAssessmentDocument } from "@/lib/assessment-generator/normalize";
import type {
  AssessmentDocument,
  AssessmentGeneratorRequest,
} from "@/lib/assessment-generator/types";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY .env.local ішінде табылмады.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateAssessmentDocument(
  request: AssessmentGeneratorRequest
) {
  const ai = getGeminiClient();
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: buildAssessmentPrompt(request),
    config: {
      responseMimeType: "application/json",
      responseSchema: assessmentResponseSchema,
      temperature: 0.2,
      maxOutputTokens: 12000,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini бос жауап қайтарды.");
  }

  let parsed: AssessmentDocument;

  try {
    parsed = JSON.parse(text) as AssessmentDocument;
  } catch {
    throw new Error("Gemini жауабын JSON ретінде оқу мүмкін болмады.");
  }

  return normalizeAssessmentDocument(parsed, request);
}
