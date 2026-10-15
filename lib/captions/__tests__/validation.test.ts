import { describe, expect, it } from "vitest";
import { validateGenerationInput } from "../validation";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const FILE = "33333333-3333-4333-8333-333333333333.jpg";

describe("validateGenerationInput", () => {
  it("accepts a photo in the user's own folder with an optional note", () => {
    expect(validateGenerationInput({ note: " hi ", imagePath: `${USER}/${FILE}` }, USER)).toEqual({
      ok: true,
      value: { note: "hi", imagePath: `${USER}/${FILE}` },
    });
    expect(validateGenerationInput({ note: "", imagePath: `${USER}/${FILE}` }, USER)).toEqual({
      ok: true,
      value: { note: null, imagePath: `${USER}/${FILE}` },
    });
  });

  it("requires a photo and rejects one outside the user's folder", () => {
    expect(validateGenerationInput({ note: "", imagePath: null }, USER)).toEqual({
      ok: false,
      errors: ["Add a photo first."],
    });
    expect(validateGenerationInput({ note: "", imagePath: `${OTHER}/${FILE}` }, USER)).toEqual({
      ok: false,
      errors: ["Add a photo first."],
    });
  });

  it("reports every problem at once", () => {
    expect(validateGenerationInput({ note: "x".repeat(201), imagePath: "nope" }, USER)).toEqual({
      ok: false,
      errors: ["Keep the note under 200 characters.", "Add a photo first."],
    });
  });
});
