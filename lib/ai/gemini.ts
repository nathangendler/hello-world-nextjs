import { AiError, type JsonRequest, type JsonResponse } from "./errors";
import { describeMissingKey, readApiKey } from "./keys";

const DEFAULT_MODEL = "gemini-3.8-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export function isGeminiConfigured(): boolean {
  return readApiKey("GEMINI_API_KEY") !== null;
}

export async function geminiGenerateJson(input: JsonRequest): Promise<JsonResponse> {
  const apiKey = readApiKey("GEMINI_API_KEY");
  if (!apiKey) {
    throw new AiError(describeMissingKey("GEMINI_API_KEY"), "not_configured");
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const parts: Array<Record<string, unknown>> = [{ text: input.prompt }];
  if (input.image) {
    parts.push({
      inline_data: { mime_type: input.image.mimeType, data: input.image.base64 },
    });
  }

  const response = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 1.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          required: ["captions"],
          properties: {
            captions: {
              type: "ARRAY",
              minItems: input.itemCount,
              maxItems: input.itemCount,
              items: { type: "STRING" },
            },
          },
        },
      },
    }),
  });

  const body = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) {
    throw new AiError(
      `The caption model returned an error (${response.status}): ${body.error?.message ?? "unknown"}`,
      "http",
    );
  }
  if (body.promptFeedback?.blockReason) {
    throw new AiError("The model declined this request. Try a different note or photo.", "blocked");
  }

  const candidate = body.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) {
    const reason = candidate?.finishReason ? ` (${candidate.finishReason})` : "";
    throw new AiError(`The model returned no captions${reason}. Try again.`, "empty");
  }
  return { model: `gemini/${model}`, text };
}
