import { describe, expect, it } from "vitest";
import { buildPrompt, parseCaptions } from "../prompt";

const EIGHT = '["a", "b", "c", "d", "e", "f", "g", "h"]';

describe("buildPrompt", () => {
  it("asks for eight varied captions and includes the note when given", () => {
    const prompt = buildPrompt({ note: "something about the pizza" });
    expect(prompt).toContain("exactly 8 distinct captions");
    expect(prompt).toContain("should roughly be about: something about the pizza");
  });

  it("omits the note line when there is no note", () => {
    expect(buildPrompt({ note: null })).not.toContain("roughly be about");
  });
});

describe("parseCaptions", () => {
  it("accepts a bare array and strips wrapping quotes", () => {
    const result = parseCaptions('["\\"a\\"", " b ", "c", "d", "e", "f", "g", "h"]');
    expect(result).toEqual({ ok: true, captions: ["a", "b", "c", "d", "e", "f", "g", "h"] });
  });

  it("accepts the {captions: [...]} object shape the prompt asks for", () => {
    expect(parseCaptions(`{"captions": ${EIGHT}}`)).toEqual({
      ok: true,
      captions: ["a", "b", "c", "d", "e", "f", "g", "h"],
    });
  });

  it("rejects non-JSON and JSON without a captions array", () => {
    expect(parseCaptions("not json").ok).toBe(false);
    expect(parseCaptions('{"text": "one"}')).toEqual({
      ok: false,
      reason: "Response did not contain a captions array.",
    });
  });

  it("rejects fewer than eight usable captions, counting duplicates once", () => {
    expect(parseCaptions('["same", "same", "", 42, "other"]')).toEqual({
      ok: false,
      reason: "Expected 8 captions, got 2.",
    });
  });

  it("keeps only the first eight when the model returns extra", () => {
    const result = parseCaptions('["a","b","c","d","e","f","g","h","i"]');
    expect(result).toEqual({ ok: true, captions: ["a", "b", "c", "d", "e", "f", "g", "h"] });
  });
});
