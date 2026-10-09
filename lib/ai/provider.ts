import { AiError, type JsonRequest, type JsonResponse } from "./errors";
import { geminiGenerateJson, isGeminiConfigured } from "./gemini";
import { groqGenerateJson, isGroqConfigured } from "./groq";

// Groq's free plan is the default; Gemini is used only when it is the sole key present.
export function isAiConfigured(): boolean {
  return isGroqConfigured() || isGeminiConfigured();
}

export async function generateJson(input: JsonRequest): Promise<JsonResponse> {
  if (isGroqConfigured()) {
    return groqGenerateJson(input);
  }
  if (isGeminiConfigured()) {
    return geminiGenerateJson(input);
  }
  throw new AiError(
    "Caption generation is not configured yet (set GROQ_API_KEY or GEMINI_API_KEY).",
    "not_configured",
  );
}
