"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPick } from "@/lib/actions/pick";
import { bracketState, roundLabel, type BracketState, type Pick } from "@/lib/captions/bracket";
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

  const state: BracketState = bracketState(captionIds, picks);

  if (state.kind === "done") {
    return (
      <p className="text-gray-500">Posting your moment…</p>
    );
  }

  function choose(winnerId: string) {
    const loserId = state.kind === "picking" ? state.pair.find((id) => id !== winnerId) : undefined;
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
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{roundLabel(state)}</span>
        <span className="text-gray-500">
          Pick {state.pickIndex + 1} of {BRACKET_PICKS}
        </span>
      </div>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: BRACKET_PICKS }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < state.pickIndex ? "bg-foreground" : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        ))}
      </div>

      <p className="text-lg font-semibold">Which caption is better?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {state.pair.map((captionId, index) => {
          const selected = chosen === captionId;
          return (
            <button
              key={captionId}
              type="button"
              disabled={pending}
              onClick={() => choose(captionId)}
              className={`min-h-28 rounded-2xl border-2 p-5 text-left text-lg leading-snug transition active:scale-[0.98] disabled:opacity-70 ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-gray-200 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-500"
              }`}
            >
              <span className="mb-2 block text-xs font-medium uppercase tracking-wide opacity-60">
                {index === 0 ? "This" : "That"}
              </span>
              {textById.get(captionId)}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
