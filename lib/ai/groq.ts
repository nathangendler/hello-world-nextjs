import { AiError, type JsonRequest, type JsonResponse } from "./errors";
import { describeMissingKey, readApiKey } from "./keys";

// Free-plan multimodal model; see https://console.groq.com/docs/vision
const DEFAULT_MODEL = "qwen/qwen3.8-27b";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

type GroqResponse = {
  choices?: Array<{ message?: { content?: string | null }; finish_reason?: string }>;
  error?: { message?: string };
};

export function isGroqConfigured(): boolean {
  return readApiKey("GROQ_API_KEY") !== null;
}

export async function groqGenerateJson(input: JsonRequest): Promise<JsonResponse> {
  const apiKey = readApiKey("GROQ_API_KEY");
  if (!apiKey) {
    throw new AiError(describeMissingKey("GROQ_API_KEY"), "not_configured");
  }
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const content: Array<Record<string, unknown>> = [{ type: "text", text: input.prompt }];
  if (input.image) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${input.image.mimeType};base64,${input.image.base64}` },
    });
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      temperature: 1.0,
      max_tokens: 600,
      response_format: { type: "json_object" },
    }),
  });

  const body = (await response.json().catch(() => ({}))) as GroqResponse;
  if (!response.ok) {
    throw new AiError(
      `The caption model returned an error (${response.status}): ${body.error?.message ?? "unknown"}`,
      "http",
    );
  }
  const choice = body.choices?.[0];
  if (choice?.finish_reason === "content_filter") {
    throw new AiError("The model declined this request. Try a different note or photo.", "blocked");
  }
  const text = choice?.message?.content;
  if (!text) {
    throw new AiError("The model returned no captions. Try again.", "empty");
  }
  return { model: `groq/${model}`, text };
}
