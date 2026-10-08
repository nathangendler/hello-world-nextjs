import { describe, expect, it } from "vitest";
import { validateGenerationInput } from "../validation";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const FILE = "33333333-3333-4333-8333-333333333333.jpg";

describe("validateGenerationInput", () => {
  it("accepts a note without a photo", () => {
    const result = validateGenerationInput({ vibe: "hype", note: " hi ", imagePath: null }, USER);
    expect(result).toEqual({ ok: true, value: { vibe: "hype", note: "hi", imagePath: null } });
  });

  it("accepts a photo in the user's own folder without a note", () => {
    const result = validateGenerationInput(
      { vibe: "poetic", note: "", imagePath: `${USER}/${FILE}` },
      USER,
    );
    expect(result).toEqual({
      ok: true,
      value: { vibe: "poetic", note: null, imagePath: `${USER}/${FILE}` },
    });
  });

  it("reports every problem at once", () => {
    const result = validateGenerationInput(
      { vibe: "angry", note: "x".repeat(301), imagePath: `${OTHER}/${FILE}` },
      USER,
    );
    expect(result).toEqual({
      ok: false,
      errors: [
        "Pick a vibe.",
        "Keep the note under 300 characters.",
        "The uploaded photo could not be used.",
      ],
    });
  });

  it("requires a note or a photo", () => {
    const result = validateGenerationInput({ vibe: "roast", note: "", imagePath: "" }, USER);
    expect(result).toEqual({ ok: false, errors: ["Add a note, a photo, or both."] });
  });
});
