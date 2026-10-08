import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { fetchFeed, isFeedSort, type FeedSort } from "@/lib/captions/feed";
import { CaptionList } from "@/components/CaptionList";

const TABS: Array<{ sort: FeedSort; label: string }> = [
  { sort: "top", label: "Top" },
  { sort: "new", label: "New" },
];

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: rawSort } = await searchParams;
  const sort: FeedSort = isFeedSort(rawSort) ? rawSort : "top";
  const [profile, captions] = await Promise.all([getCurrentProfile(), fetchFeed(sort, 60)]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Feed</h1>
        <nav className="flex gap-1 rounded-lg border border-gray-300 p-1 text-sm dark:border-gray-700">
          {TABS.map((tab) => (
            <Link
              key={tab.sort}
              href={`/feed?sort=${tab.sort}`}
              className={`rounded-md px-3 py-1 ${
                tab.sort === sort ? "bg-foreground text-background" : ""
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {!profile && (
        <p className="text-sm text-gray-500">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to rate captions and generate your own.
        </p>
      )}
      <CaptionList
        captions={captions}
        viewerId={profile?.id ?? null}
        showContext
        emptyMessage="No captions yet."
      />
    </main>
  );
}
