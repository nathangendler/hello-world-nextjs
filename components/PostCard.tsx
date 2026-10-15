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
    <article className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <Link href={`/g/${post.id}`} className="block bg-gray-100 dark:bg-gray-900">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          width={1200}
          height={900}
          sizes="(max-width: 672px) 100vw, 672px"
          priority={large}
          className={`w-full object-cover ${large ? "max-h-[32rem]" : "max-h-96"}`}
        />
      </Link>
      <div className="flex flex-col gap-3 p-4">
        <p className={`leading-snug ${large ? "text-2xl font-semibold" : "text-lg font-medium"}`}>
          {post.caption}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{timeAgo(post.postedAt)}</span>
            {isMine && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
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
