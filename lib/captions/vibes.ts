export const VIBES = ["hype", "roast", "poetic", "midwest"] as const;
export type Vibe = (typeof VIBES)[number];

export const VIBE_DETAILS: Record<
  Vibe,
  { label: string; blurb: string; instruction: string }
> = {
  hype: {
    label: "Hype",
    blurb: "Main-character energy.",
    instruction:
      "Confident, high-energy, main-character energy. Short punchy lines. One emoji at most.",
  },
  roast: {
    label: "Roast",
    blurb: "Lovingly drag yourself.",
    instruction:
      "Self-deprecating and funny. Roast the person in the moment with affection, never cruelty. No emoji.",
  },
  poetic: {
    label: "Poetic",
    blurb: "Soft, a little pretentious.",
    instruction:
      "Wistful and observational, like a lowercase indie lyric. Concrete sensory details. No emoji, no hashtags.",
  },
  midwest: {
    label: "Midwest Mom",
    blurb: "Wholesome, mildly alarmed by NYC.",
    instruction:
      "Warm, wholesome, and slightly alarmed by New York City, in the voice of a Midwestern mom texting her kid. Folksy phrasing welcome.",
  },
};

export function isVibe(value: unknown): value is Vibe {
  return typeof value === "string" && (VIBES as readonly string[]).includes(value);
}
