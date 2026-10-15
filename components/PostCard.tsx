import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/captions/moments";
import { CopyButton } from "@/components/CopyButton";
import { LikeButton } from "@/components/LikeButton";

export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({
  post,
  liked,
  canLike,
  isMine,
  large,
}: {
  post: Post;
  liked: boolean;
  canLike: boolean;
  isMine: boolean;
  large: boolean;
}) {
  return (
    <article className="card overflow-hidden">
      <Link href={`/g/${post.id}`} className="block bg-gray-soft">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          width={1200}
          height={900}
          sizes="(max-width: 672px) 100vw, 672px"
          priority={large}
          className={`mx-auto h-auto w-auto max-w-full object-contain ${large ? "max-h-[36rem]" : "max-h-[28rem]"}`}
        />
      </Link>
      <div className="flex flex-col gap-3 p-4">
        <p className={`title leading-snug ${large ? "text-[22px]" : "text-[18px]"}`}>{post.caption}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] text-subtle">
            <span>{timeAgo(post.postedAt)}</span>
            {isMine && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-ink">
                Yours
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={post.caption} />
            <LikeButton postId={post.id} liked={liked} likeCount={post.likeCount} canLike={canLike} />
          </div>
        </div>
      </div>
    </article>
  );
}
