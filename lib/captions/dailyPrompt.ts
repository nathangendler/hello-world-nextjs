// One rotating prompt per day gives Sam a reason to open the app and something
// specific to post about. Indexed by UTC day so everyone sees the same prompt.
export const DAILY_PROMPTS = [
  "Your first time getting hopelessly lost in the subway",
  "The dollar slice that changed your life",
  "Dorm room at 2am during midterms",
  "A perfect bench in Riverside Park",
  "The Trader Joe's line on 72nd Street",
  "Bodega cat appreciation post",
  "Trying to pass as a local in Williamsburg",
  "Walking the Brooklyn Bridge for the first time",
  "Halal cart dinner, zero regrets",
  "A rooftop you were not supposed to be on",
  "Caught in the rain with no umbrella",
  "Sunday reset in Butler Library",
  "Chinatown dumpling run with friends",
  "Central Park picnic with dining hall snacks",
] as const;

export function dailyPrompt(date: Date): string {
  const dayNumber = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );
  return DAILY_PROMPTS[dayNumber % DAILY_PROMPTS.length];
}
