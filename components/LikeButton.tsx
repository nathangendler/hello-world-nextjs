"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/like";

export function LikeButton({
  postId,
  liked,
  likeCount,
  canLike,
}: {
  postId: string;
  liked: boolean;
  likeCount: number;
  canLike: boolean;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likeCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canLike) {
    return (
      <Link href="/login" className="btn-outline btn-sm gap-1.5 text-subtle" title="Sign in to like">
        <span aria-hidden>♡</span> {count}
      </Link>
    );
  }

  function toggle() {
    const next = !isLiked;
    setIsLiked(next);
    setCount((current) => current + (next ? 1 : -1));
    setError(null);
    startTransition(async () => {
      try {
        const result = await toggleLike(postId, next);
        if (!result.ok) {
          setIsLiked(!next);
          setCount((current) => current + (next ? -1 : 1));
          setError(result.error);
        }
      } catch {
        setIsLiked(!next);
        setCount((current) => current + (next ? -1 : 1));
        setError("Could not save your like.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={isLiked}
        className={`btn-outline btn-sm gap-1.5 ${isLiked ? "border-liked text-liked" : ""}`}
      >
        <span aria-hidden className="text-base leading-none">
          {isLiked ? "♥" : "♡"}
        </span>
        {count}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
