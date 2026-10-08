import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { fetchFeed } from "@/lib/captions/feed";
import { CaptionList } from "@/components/CaptionList";
import { DailyPromptCard } from "@/components/DailyPromptCard";

export default async function Home() {
  const [profile, topCaptions] = await Promise.all([getCurrentProfile(), fetchFeed("top", 6)]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Caption the City</h1>
        <p className="text-lg text-gray-500">
          Drop a photo or a note about your NYC moment, pick a vibe, and get three
          AI-written captions. Everyone rates them 1 to 10. The best ones rise.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/generate"
            className="rounded-lg bg-foreground px-5 py-2.5 font-medium text-background"
          >
            Generate captions
          </Link>
          <Link href="/feed" className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium dark:border-gray-700">
            Browse the feed
          </Link>
        </div>
      </section>

      <DailyPromptCard showCta />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Top rated right now</h2>
          <Link href="/feed?sort=top" className="text-sm underline">
            See all
          </Link>
        </div>
        <CaptionList
          captions={topCaptions}
          viewerId={profile?.id ?? null}
          showContext
          emptyMessage="Nothing has been captioned yet. Be the first."
        />
      </section>

      <p className="text-sm text-gray-500">
        Looking for the albums demo? It still lives at{" "}
        <Link href="/albums" className="underline">
          /albums
        </Link>
        .
      </p>
    </main>
  );
}
