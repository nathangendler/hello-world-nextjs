import { BRACKET_PICKS, CAPTION_COUNT } from "./config";

export type Pick = { winnerId: string; loserId: string };

export type BracketState =
  | {
      kind: "picking";
      round: number; // 1-based
      roundCount: number;
      pickIndex: number; // 0-based, next pick to make
      pair: [string, string];
    }
  | { kind: "done"; championId: string };

// Pure single-elimination bracket. Captions pair up in order (1v2, 3v4, ...);
// each round's winners, in order, pair up again. Picks are replayed to find the
// current pair, so the same function drives the UI and validates server-side.
export function bracketState(captionIds: string[], picks: Pick[]): BracketState {
  if (captionIds.length !== CAPTION_COUNT) {
    throw new Error(`A bracket needs ${CAPTION_COUNT} captions, got ${captionIds.length}.`);
  }
  const roundCount = Math.log2(CAPTION_COUNT);
  let contenders = captionIds;
  let round = 1;
  let consumed = 0;

  while (contenders.length > 1) {
    const matches = contenders.length / 2;
    const winners: string[] = [];
    for (let match = 0; match < matches; match += 1) {
      const pair: [string, string] = [contenders[match * 2], contenders[match * 2 + 1]];
      const pick = picks[consumed];
      if (!pick) {
        return { kind: "picking", round, roundCount, pickIndex: consumed, pair };
      }
      if (!isPickFor(pick, pair)) {
        throw new Error(`Pick ${consumed} does not match the bracket pair.`);
      }
      winners.push(pick.winnerId);
      consumed += 1;
    }
    contenders = winners;
    round += 1;
  }

  if (consumed !== BRACKET_PICKS) {
    throw new Error(`Expected ${BRACKET_PICKS} picks, got ${consumed}.`);
  }
  return { kind: "done", championId: contenders[0] };
}

export function isPickFor(pick: Pick, pair: [string, string]): boolean {
  return (
    (pick.winnerId === pair[0] && pick.loserId === pair[1]) ||
    (pick.winnerId === pair[1] && pick.loserId === pair[0])
  );
}

export function roundLabel(state: Extract<BracketState, { kind: "picking" }>): string {
  const remaining = CAPTION_COUNT / 2 ** (state.round - 1);
  if (remaining === 2) return "Final";
  if (remaining === 4) return "Semifinals";
  return `Round of ${remaining}`;
}
