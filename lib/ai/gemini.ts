const DEFAULT_MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiErrorKind = "not_configured" | "blocked" | "http" | "empty";

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly kind: GeminiErrorKind,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export type GeminiImage = { mimeType: string; base64: string };

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Asks Gemini for a JSON array of strings. Returns the raw text; parsing is the caller's job.
export async function generateJsonArray(input: {
  prompt: string;
  image: GeminiImage | null;
  itemCount: number;
}): Promise<{ model: string; text: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "Caption generation is not configured yet (missing GEMINI_API_KEY).",
      "not_configured",
    );
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
          type: "ARRAY",
          minItems: input.itemCount,
          maxItems: input.itemCount,
          items: { type: "STRING" },
        },
      },
    }),
  });

  const body = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) {
    throw new GeminiError(
      `The caption model returned an error (${response.status}): ${body.error?.message ?? "unknown"}`,
      "http",
    );
  }
  if (body.promptFeedback?.blockReason) {
    throw new GeminiError(
      "The model declined this request. Try a different note or photo.",
      "blocked",
    );
  }

  const candidate = body.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) {
    const reason = candidate?.finishReason ? ` (${candidate.finishReason})` : "";
    throw new GeminiError(`The model returned no captions${reason}. Try again.`, "empty");
  }
  return { model, text };
}
