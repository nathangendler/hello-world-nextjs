import { CAPTION_COUNT, MAX_CAPTION_LENGTH } from "./config";
import { VIBE_DETAILS, type Vibe } from "./vibes";

export function buildPrompt(input: {
  vibe: Vibe;
  note: string | null;
  hasImage: boolean;
}): string {
  const lines = [
    "You write short social media captions for a college student who just moved to New York City.",
    `Vibe: ${VIBE_DETAILS[input.vibe].instruction}`,
    `Write exactly ${CAPTION_COUNT} distinct captions. Each one is a single line under 110 characters, with no hashtags and no surrounding quotation marks.`,
    "Mention specific details from the photo and the note when they are given. Never invent names of people.",
    `Respond with JSON only, in this exact shape: {"captions": ["...", "...", "..."]} with ${CAPTION_COUNT} strings.`,
  ];
  if (input.hasImage) {
    lines.push("A photo of the moment is attached.");
  }
  if (input.note) {
    lines.push(`Note from the student about the moment: ${input.note}`);
  }
  return lines.join("\n");
}

export type ParsedCaptions =
  | { ok: true; captions: string[] }
  | { ok: false; reason: string };

// The model is asked for JSON, but it is still untrusted output: check the shape here.
export function parseCaptions(raw: string): ParsedCaptions {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "Response was not valid JSON." };
  }
  // Accept either a bare array or the {"captions": [...]} object the prompt asks for.
  const list =
    Array.isArray(value)
      ? value
      : value !== null && typeof value === "object" && "captions" in value
        ? (value as { captions: unknown }).captions
        : null;
  if (!Array.isArray(list)) {
    return { ok: false, reason: "Response did not contain a captions array." };
  }

  const captions = list
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/^["'“”]+|["'“”]+$/g, "").trim())
    .filter((item) => item.length > 0)
    .map((item) => item.slice(0, MAX_CAPTION_LENGTH));
  const unique = Array.from(new Set(captions));

  if (unique.length < CAPTION_COUNT) {
    return {
      ok: false,
      reason: `Expected ${CAPTION_COUNT} captions, got ${unique.length}.`,
    };
  }
  return { ok: true, captions: unique.slice(0, CAPTION_COUNT) };
}
