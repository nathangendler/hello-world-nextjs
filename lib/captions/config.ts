export const CAPTION_COUNT = 3;
export const MAX_NOTE_LENGTH = 300;
export const MAX_CAPTION_LENGTH = 300;
export const MIN_SCORE = 1;
export const MAX_SCORE = 10;
// Protects the free model quota; a persona like Sam posts a few moments a day, not dozens.
export const DAILY_GENERATION_LIMIT = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MOMENTS_BUCKET = "moments";
