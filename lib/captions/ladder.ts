import { BRACKET_PICKS, CAPTION_COUNT } from "./config";

export type Pick = { winnerId: string; loserId: string };

export type LadderState =
  | {
      kind: "picking";
      pickIndex: number; // 0-based, next pick to make
      // Left and right slots. The current winner keeps its slot between picks.
      pair: [string, string];
      // Null before the first pick; afterwards the caption that has survived so far.
      champion: string | null;
    }
  | { kind: "done"; championId: string };

// Pure "winner stays on" ladder: captions 1 and 2 face off; the winner keeps its
// slot and the next caption takes the loser's slot, until all 8 have appeared.
// Picks are replayed to find the current pair, so the same function drives the UI
// and validates picks server-side.
export function ladderState(captionIds: string[], picks: Pick[]): LadderState {
  if (captionIds.length !== CAPTION_COUNT) {
    throw new Error(`A ladder needs ${CAPTION_COUNT} captions, got ${captionIds.length}.`);
  }
  const pair: [string, string] = [captionIds[0], captionIds[1]];
  let champion: string | null = null;

  picks.forEach((pick, index) => {
    if (index >= BRACKET_PICKS) {
      throw new Error(`Expected at most ${BRACKET_PICKS} picks, got ${picks.length}.`);
    }
    if (!isPickFor(pick, pair)) {
      throw new Error(`Pick ${index} does not match the current pair.`);
    }
    champion = pick.winnerId;
    const loserSlot = pair[0] === pick.winnerId ? 1 : 0;
    const nextChallenger = captionIds[index + 2];
    if (nextChallenger) {
      pair[loserSlot] = nextChallenger;
    }
  });

  if (picks.length === BRACKET_PICKS && champion) {
    return { kind: "done", championId: champion };
  }
  return { kind: "picking", pickIndex: picks.length, pair, champion };
}

export function isPickFor(pick: Pick, pair: [string, string]): boolean {
  return (
    (pick.winnerId === pair[0] && pick.loserId === pair[1]) ||
    (pick.winnerId === pair[1] && pick.loserId === pair[0])
  );
}
