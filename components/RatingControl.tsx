"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { rateCaption } from "@/lib/actions/rate";
import { MAX_SCORE, MIN_SCORE } from "@/lib/captions/config";

const SCORES = Array.from({ length: MAX_SCORE - MIN_SCORE + 1 }, (_, i) => MIN_SCORE + i);

export function RatingControl({
  captionId,
  myScore,
  canRate,
}: {
  captionId: string;
  myScore: number | null;
  canRate: boolean;
}) {
  const [score, setScore] = useState(myScore);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function rate(next: number) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await rateCaption(captionId, next);
        if (result.ok) {
          setScore(result.score);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Something went wrong while saving your rating. Please try again.");
      }
    });
  }

  if (!canRate) {
    return (
      <p className="text-sm text-gray-500">
        <Link href="/login" className="underline">
          Sign in
        </Link>{" "}
        to rate this caption.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        role="radiogroup"
        aria-label="Rate this caption from 1 to 10"
        className="flex flex-wrap gap-1"
      >
        {SCORES.map((value) => {
          const selected = score === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => rate(value)}
              className={`h-8 w-8 rounded-full border text-sm font-medium transition disabled:opacity-60 ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        {error ?? (score === null ? "Tap a number to rate." : `You rated this ${score}/10.`)}
      </p>
    </div>
  );
}
