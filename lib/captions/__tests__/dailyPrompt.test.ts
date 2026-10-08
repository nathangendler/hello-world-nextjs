import { describe, expect, it } from "vitest";
import { DAILY_PROMPTS, dailyPrompt } from "../dailyPrompt";

describe("dailyPrompt", () => {
  it("is stable within a UTC day and changes the next day", () => {
    const morning = new Date("2026-10-08T01:00:00Z");
    const night = new Date("2026-10-08T23:59:00Z");
    const tomorrow = new Date("2026-10-09T00:00:00Z");
    expect(dailyPrompt(morning)).toBe(dailyPrompt(night));
    expect(dailyPrompt(tomorrow)).not.toBe(dailyPrompt(morning));
  });

  it("cycles through every prompt", () => {
    const seen = new Set<string>();
    for (let day = 0; day < DAILY_PROMPTS.length; day += 1) {
      seen.add(dailyPrompt(new Date(Date.UTC(2026, 0, 1 + day))));
    }
    expect(seen.size).toBe(DAILY_PROMPTS.length);
  });
});
