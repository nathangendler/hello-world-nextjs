import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { fetchMoment, fetchMyLikes, fetchPost } from "@/lib/captions/moments";
import { BracketPicker } from "@/components/BracketPicker";
import { PostCard } from "@/components/PostCard";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }
  const [profile, post] = await Promise.all([getCurrentProfile(), fetchPost(id)]);

  if (post) {
    const myLikes = await fetchMyLikes([post.id], profile !== null);
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-8">
        <PostCard
          post={post}
          liked={myLikes.has(post.id)}
          canLike={profile !== null}
          isMine={post.userId === profile?.id}
          large
        />
        {post.userNote && (
          <p className="text-sm text-gray-500">
            Asked for: <span className="italic">{post.userNote}</span>
          </p>
        )}
        <div className="flex gap-4 text-sm">
          <Link href="/generate" className="underline">
            Post your own moment
          </Link>
          <Link href="/" className="underline">
            Back to moments
          </Link>
        </div>
      </main>
    );
  }

  // Not posted: only the owner can see it (RLS), and it is their bracket to finish.
  // Anonymous visitors have no access to picks at all, so don't even look.
  if (!profile) {
    notFound();
  }
  const moment = await fetchMoment(id);
  if (!moment || moment.userId !== profile.id) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
        <Image
          src={moment.imageUrl}
          alt="Your moment"
          width={1200}
          height={900}
          sizes="(max-width: 672px) 100vw, 672px"
          priority
          className="max-h-80 w-full object-cover"
        />
      </div>
      <BracketPicker momentId={moment.id} captions={moment.captions} initialPicks={moment.picks} />
    </main>
  );
}
