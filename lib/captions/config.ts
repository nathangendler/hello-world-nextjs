// Eight captions make a clean three-round bracket: 4 + 2 + 1 = 7 picks.
export const CAPTION_COUNT = 8;
export const BRACKET_PICKS = CAPTION_COUNT - 1;
export const MAX_NOTE_LENGTH = 200;
export const MAX_CAPTION_LENGTH = 300;
// Protects the free model quota; a persona like Sam posts a few moments a day, not dozens.
export const DAILY_GENERATION_LIMIT = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Photos are downscaled in the browser before upload so the model request stays small.
export const MAX_IMAGE_EDGE = 1600;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MOMENTS_BUCKET = "moments";
