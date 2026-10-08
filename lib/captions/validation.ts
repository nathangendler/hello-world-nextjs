import { MAX_NOTE_LENGTH } from "./config";
import { isVibe, type Vibe } from "./vibes";

export type GenerationInput = {
  vibe: Vibe;
  note: string | null;
  // Storage object path inside the moments bucket, always under the user's own folder.
  imagePath: string | null;
};

export type ValidationResult =
  | { ok: true; value: GenerationInput }
  | { ok: false; errors: string[] };

const IMAGE_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/i;

export function validateGenerationInput(
  raw: { vibe: unknown; note: unknown; imagePath: unknown },
  userId: string,
): ValidationResult {
  const errors: string[] = [];

  if (!isVibe(raw.vibe)) {
    errors.push("Pick a vibe.");
  }

  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  if (note.length > MAX_NOTE_LENGTH) {
    errors.push(`Keep the note under ${MAX_NOTE_LENGTH} characters.`);
  }

  let imagePath: string | null = null;
  if (raw.imagePath !== null && raw.imagePath !== undefined && raw.imagePath !== "") {
    if (
      typeof raw.imagePath !== "string" ||
      !IMAGE_PATH.test(raw.imagePath) ||
      !raw.imagePath.startsWith(`${userId}/`)
    ) {
      errors.push("The uploaded photo could not be used.");
    } else {
      imagePath = raw.imagePath;
    }
  }

  if (!note && !imagePath) {
    errors.push("Add a note, a photo, or both.");
  }

  if (errors.length > 0 || !isVibe(raw.vibe)) {
    return { ok: false, errors };
  }
  return { ok: true, value: { vibe: raw.vibe, note: note || null, imagePath } };
}
