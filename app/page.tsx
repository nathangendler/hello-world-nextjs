import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { fetchPosts, isPostSort, type PostSort } from "@/lib/captions/moments";
import { DailyPromptCard } from "@/components/DailyPromptCard";
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Caption the City</h1>
        <p className="text-lg text-gray-500">
          Upload a photo of your NYC moment. The AI writes eight captions, you pick
          head-to-head until one survives, and that one gets posted here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/generate"
            className="rounded-xl bg-foreground px-5 py-2.5 font-semibold text-background"
          >
            {profile ? "Post a moment" : "Sign in to post"}
          </Link>
        </div>
      </section>

      <DailyPromptCard showCta />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Moments</h2>
          <nav className="flex gap-1 rounded-lg border border-gray-300 p-1 text-sm dark:border-gray-700">
            {TABS.map((tab) => (
              <Link
                key={tab.sort}
                href={tab.sort === "new" ? "/" : `/?sort=${tab.sort}`}
                className={`rounded-md px-3 py-1 ${
                  tab.sort === sort ? "bg-foreground text-background" : ""
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
