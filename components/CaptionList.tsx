import type { FeedCaption } from "@/lib/captions/feed";
import { fetchMyRatings } from "@/lib/captions/feed";
import { CaptionCard } from "@/components/CaptionCard";

export async function CaptionList({
  captions,
  viewerId,
  showContext,
  emptyMessage,
}: {
  captions: FeedCaption[];
  viewerId: string | null;
  showContext: boolean;
  emptyMessage: string;
}) {
  const myRatings = await fetchMyRatings(
    captions.map((caption) => caption.id),
    viewerId !== null,
  );

  if (captions.length === 0) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {captions.map((caption) => (
        <CaptionCard
          key={caption.id}
          caption={caption}
          myScore={myRatings.get(caption.id) ?? null}
          canRate={viewerId !== null}
          isMine={caption.userId === viewerId}
          showContext={showContext}
        />
      ))}
    </div>
  );
}
