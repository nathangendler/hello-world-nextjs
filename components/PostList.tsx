import type { Post } from "@/lib/captions/moments";
import { fetchMyLikes } from "@/lib/captions/moments";
import { PostCard } from "@/components/PostCard";

export async function PostList({
  posts,
  viewerId,
  emptyMessage,
}: {
  posts: Post[];
  viewerId: string | null;
  emptyMessage: string;
}) {
  const myLikes = await fetchMyLikes(
    posts.map((post) => post.id),
    viewerId !== null,
  );

  if (posts.length === 0) {
    return <p className="text-[13px] text-subtle">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          liked={myLikes.has(post.id)}
          canLike={viewerId !== null}
          isMine={post.userId === viewerId}
          large={false}
        />
      ))}
    </div>
  );
}
