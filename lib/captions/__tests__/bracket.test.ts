import { describe, expect, it } from "vitest";
import { bracketState, roundLabel, type Pick } from "../bracket";

const IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const pick = (winnerId: string, loserId: string): Pick => ({ winnerId, loserId });

describe("bracketState", () => {
  it("starts with the first pair of round one", () => {
    expect(bracketState(IDS, [])).toEqual({
      kind: "picking",
      round: 1,
      roundCount: 3,
      pickIndex: 0,
      pair: ["c1", "c2"],
    });
  });

  it("advances through round one in order, then pairs the winners", () => {
    const picks = [pick("c2", "c1"), pick("c3", "c4"), pick("c6", "c5"), pick("c7", "c8")];
    expect(bracketState(IDS, picks.slice(0, 3))).toMatchObject({ round: 1, pickIndex: 3, pair: ["c7", "c8"] });
    expect(bracketState(IDS, picks)).toMatchObject({ round: 2, pickIndex: 4, pair: ["c2", "c3"] });
  });

  it("crowns a champion after seven picks", () => {
    const picks = [
      pick("c2", "c1"), pick("c3", "c4"), pick("c6", "c5"), pick("c7", "c8"),
      pick("c3", "c2"), pick("c7", "c6"),
      pick("c7", "c3"),
    ];
    expect(bracketState(IDS, picks)).toEqual({ kind: "done", championId: "c7" });
  });

  it("accepts a pick in either order but rejects one from the wrong pair", () => {
    expect(bracketState(IDS, [pick("c1", "c2")])).toMatchObject({ pickIndex: 1 });
    expect(() => bracketState(IDS, [pick("c3", "c4")])).toThrow("does not match");
  });

  it("rejects the wrong number of captions", () => {
    expect(() => bracketState(IDS.slice(0, 6), [])).toThrow("needs 8 captions");
  });
});

describe("roundLabel", () => {
  it("names each round", () => {
    const base = { kind: "picking" as const, roundCount: 3, pickIndex: 0, pair: ["a", "b"] as [string, string] };
    expect(roundLabel({ ...base, round: 1 })).toBe("Round of 8");
    expect(roundLabel({ ...base, round: 2 })).toBe("Semifinals");
    expect(roundLabel({ ...base, round: 3 })).toBe("Final");
  });
});
