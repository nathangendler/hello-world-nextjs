"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPick } from "@/lib/actions/pick";
import { ladderState, type LadderState, type Pick } from "@/lib/captions/ladder";
import { BRACKET_PICKS } from "@/lib/captions/config";
import type { Caption } from "@/lib/captions/moments";

export function BracketPicker({
  momentId,
  captions,
  initialPicks,
}: {
  momentId: string;
  captions: Caption[];
  initialPicks: Pick[];
}) {
  const router = useRouter();
  const captionIds = captions.map((caption) => caption.id);
  const textById = new Map(captions.map((caption) => [caption.id, caption.text]));
  const [picks, setPicks] = useState<Pick[]>(initialPicks);
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const state: LadderState = ladderState(captionIds, picks);

  if (state.kind === "done") {
    return <p className="text-[13px] text-subtle">Posting your moment…</p>;
  }

  function choose(winnerId: string) {
    if (state.kind !== "picking") return;
    const loserId = state.pair.find((id) => id !== winnerId);
    if (!loserId) return;
    setChosen(winnerId);
    setError(null);
    startTransition(async () => {
      try {
        const result = await recordPick({ momentId, winnerId, loserId });
        if (!result.ok) {
          setError(result.error);
          setChosen(null);
          return;
        }
        setPicks((current) => [...current, { winnerId, loserId }]);
        setChosen(null);
        if (result.state.kind === "done") {
          router.refresh();
        }
      } catch {
        setError("Something went wrong while saving your pick. Please try again.");
        setChosen(null);
      }
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Head to head</span>
        <span className="text-[10.5px] text-muted">
          pick {state.pickIndex + 1} of {BRACKET_PICKS}
        </span>
      </div>
      <h2 className="title text-[17px] leading-[22px]">Which caption is better?</h2>

      <div className="relative grid gap-3 sm:grid-cols-2 sm:gap-4">
        {state.pair.map((captionId, index) => {
          const selected = chosen === captionId;
          const isChampion = state.champion === captionId;
          return (
            <button
              key={`${index}-${captionId}`}
              type="button"
              disabled={pending}
              onClick={() => choose(captionId)}
              className={`card flex min-h-36 flex-col justify-between gap-4 p-4 text-left transition active:scale-[0.99] disabled:opacity-70 ${
                selected ? "border-ink ring-1 ring-ink" : "hover:border-ink/60"
              }`}
            >
              <span className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">
                  {index === 0 ? "This" : "That"}
                  {isChampion && (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 normal-case tracking-normal text-ink">
                      Still standing
                    </span>
                  )}
                </span>
                <span className="text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-ink">
                  {textById.get(captionId)}
                </span>
              </span>
              <span
                className={`btn btn-sm w-full border border-ink ${
                  selected ? "bg-ink text-cream" : "bg-transparent text-ink"
                }`}
              >
                {selected ? "Picked" : "Pick"}
              </span>
            </button>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cream bg-ink text-[11px] font-extrabold text-cream sm:flex"
        >
          VS
        </span>
      </div>

      <div className="mt-1 flex gap-1" aria-hidden>
        {Array.from({ length: BRACKET_PICKS }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index < state.pickIndex ? "bg-accent-strong" : "bg-dot-idle"
            }`}
          />
        ))}
      </div>
      <p className="text-[12px] text-subtle">
        The winner stays on. A new caption takes the loser&apos;s spot until all eight have had a turn.
      </p>
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </section>
  );
}
