import { MAX_NOTE_LENGTH } from "./config";

export type GenerationInput = {
  note: string | null;
  // Storage object path inside the moments bucket, always under the user's own folder.
  imagePath: string;
};

export type ValidationResult =
  | { ok: true; value: GenerationInput }
  | { ok: false; errors: string[] };

const IMAGE_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/i;

export function validateGenerationInput(
  raw: { note: unknown; imagePath: unknown },
  userId: string,
): ValidationResult {
  const errors: string[] = [];

  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  if (note.length > MAX_NOTE_LENGTH) {
    errors.push(`Keep the note under ${MAX_NOTE_LENGTH} characters.`);
  }

  const imagePath =
    typeof raw.imagePath === "string" &&
    IMAGE_PATH.test(raw.imagePath) &&
    raw.imagePath.startsWith(`${userId}/`)
      ? raw.imagePath
      : null;
  if (!imagePath) {
    errors.push("Add a photo first.");
  }

  if (errors.length > 0 || !imagePath) {
    return { ok: false, errors };
  }
  return { ok: true, value: { note: note || null, imagePath } };
}
