import { describe, expect, it } from "vitest";
import { ladderState, type Pick } from "../ladder";

const IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const pick = (winnerId: string, loserId: string): Pick => ({ winnerId, loserId });

describe("ladderState", () => {
  it("starts with the first two captions and no champion", () => {
    expect(ladderState(IDS, [])).toEqual({
      kind: "picking",
      pickIndex: 0,
      pair: ["c1", "c2"],
      champion: null,
    });
  });

  it("keeps the winner in its slot and puts the next caption in the loser's slot", () => {
    expect(ladderState(IDS, [pick("c2", "c1")])).toEqual({
      kind: "picking",
      pickIndex: 1,
      pair: ["c3", "c2"],
      champion: "c2",
    });
    expect(ladderState(IDS, [pick("c2", "c1"), pick("c3", "c2")])).toMatchObject({
      pickIndex: 2,
      pair: ["c3", "c4"],
      champion: "c3",
    });
  });

  it("crowns the last winner after seven picks", () => {
    const picks = [
      pick("c1", "c2"), pick("c1", "c3"), pick("c4", "c1"), pick("c4", "c5"),
      pick("c6", "c4"), pick("c6", "c7"), pick("c8", "c6"),
    ];
    expect(ladderState(IDS, picks.slice(0, 6))).toMatchObject({ pickIndex: 6, pair: ["c6", "c8"] });
    expect(ladderState(IDS, picks)).toEqual({ kind: "done", championId: "c8" });
  });

  it("accepts a pick in either order but rejects one from the wrong pair", () => {
    expect(ladderState(IDS, [pick("c1", "c2")])).toMatchObject({ pickIndex: 1 });
    expect(() => ladderState(IDS, [pick("c3", "c4")])).toThrow("does not match");
  });

  it("rejects the wrong number of captions", () => {
    expect(() => ladderState(IDS.slice(0, 6), [])).toThrow("needs 8 captions");
  });
});
