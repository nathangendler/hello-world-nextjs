import { describe, expect, it } from "vitest";
import { buildPrompt, parseCaptions } from "../prompt";

describe("buildPrompt", () => {
  it("includes the vibe instruction and the note", () => {
    const prompt = buildPrompt({ vibe: "roast", note: "lost on the 1 train", hasImage: false });
    expect(prompt).toContain("Self-deprecating");
    expect(prompt).toContain("Note from the student about the moment: lost on the 1 train");
    expect(prompt).not.toContain("A photo of the moment is attached.");
  });

  it("mentions the photo when one is attached and omits an empty note", () => {
    const prompt = buildPrompt({ vibe: "hype", note: null, hasImage: true });
    expect(prompt).toContain("A photo of the moment is attached.");
    expect(prompt).not.toContain("Note from the student");
  });
});

describe("parseCaptions", () => {
  it("accepts a JSON array of three strings and strips wrapping quotes", () => {
    const result = parseCaptions('["\\"first\\"", " second ", "third"]');
    expect(result).toEqual({ ok: true, captions: ["first", "second", "third"] });
  });

  it("rejects non-JSON", () => {
    expect(parseCaptions("not json").ok).toBe(false);
  });

  it("rejects fewer than three usable captions, counting duplicates once", () => {
    const result = parseCaptions('["same", "same", "", 42, "other"]');
    expect(result).toEqual({ ok: false, reason: "Expected 3 captions, got 2." });
  });

  it("keeps only the first three when the model returns extra", () => {
    const result = parseCaptions('["a", "b", "c", "d"]');
    expect(result).toEqual({ ok: true, captions: ["a", "b", "c"] });
  });
});
