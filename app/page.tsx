import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { fetchPosts, isPostSort, type PostSort } from "@/lib/captions/moments";
import { PostList } from "@/components/PostList";

const TABS: Array<{ sort: PostSort; label: string }> = [
  { sort: "new", label: "New" },
  { sort: "top", label: "Top" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: rawSort } = await searchParams;
  const sort: PostSort = isPostSort(rawSort) ? rawSort : "new";
  const [profile, posts] = await Promise.all([getCurrentProfile(), fetchPosts(sort, 40)]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-7 sm:px-8">
      <section className="flex flex-col gap-2 border-b border-hairline pb-6">
        <span className="eyebrow">Caption This</span>
        <h1 className="title text-[28px] leading-tight sm:text-[32px]">
          Eight captions. Seven picks. One post.
        </h1>
        <p className="text-[14px] leading-relaxed text-subtle">
          Upload a photo and the AI writes eight captions. Pick head-to-head until one survives.
          That one gets posted here for everyone to like.
        </p>
        <div className="mt-2">
          <Link href="/generate" className="btn-primary">
            {profile ? "Post a moment" : "Sign in to post"}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Moments</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.sort}
                href={tab.sort === "new" ? "/" : `/?sort=${tab.sort}`}
                className={`btn btn-sm border border-ink ${
                  tab.sort === sort ? "bg-ink text-cream" : "text-ink"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <PostList
          posts={posts}
          viewerId={profile?.id ?? null}
          emptyMessage="Nothing has been posted yet. Be the first."
        />
      </section>
    </main>
  );
}
