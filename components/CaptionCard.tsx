import Image from "next/image";
import Link from "next/link";
import type { FeedCaption } from "@/lib/captions/feed";
import { VIBE_DETAILS } from "@/lib/captions/vibes";
import { CopyButton } from "@/components/CopyButton";
import { RatingControl } from "@/components/RatingControl";

export function ScoreSummary({ caption }: { caption: FeedCaption }) {
  if (caption.ratingCount === 0) {
    return <span className="text-sm text-gray-500">No ratings yet</span>;
  }
  return (
    <span className="text-sm text-gray-500">
      <span className="font-semibold text-foreground">{caption.averageScore?.toFixed(1)}</span>
      /10 from {caption.ratingCount} {caption.ratingCount === 1 ? "rating" : "ratings"}
    </span>
  );
}

export function CaptionCard({
  caption,
  myScore,
  canRate,
  isMine,
  showContext,
}: {
  caption: FeedCaption;
  myScore: number | null;
  canRate: boolean;
  isMine: boolean;
  // Feed cards show the moment (photo, note, vibe); generation pages show it once above.
  showContext: boolean;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      {showContext && (
        <Link href={`/g/${caption.generationId}`} className="flex items-center gap-3">
          {caption.imageUrl && (
            <Image
              src={caption.imageUrl}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 text-sm text-gray-500">
            <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {VIBE_DETAILS[caption.vibe].label}
            </span>
            {isMine && (
              <span className="mr-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Yours
              </span>
            )}
            {caption.userNote && <span className="line-clamp-2">{caption.userNote}</span>}
          </div>
        </Link>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-lg leading-snug">{caption.text}</p>
        <CopyButton text={caption.text} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScoreSummary caption={caption} />
        <RatingControl captionId={caption.id} myScore={myScore} canRate={canRate} />
      </div>
    </article>
  );
}
