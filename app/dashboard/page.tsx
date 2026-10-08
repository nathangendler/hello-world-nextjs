import Link from "next/link";
import { requireCompleteProfile } from "@/lib/auth";
import { fetchUserCaptions } from "@/lib/captions/feed";
import { displayName } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";
import { CaptionList } from "@/components/CaptionList";

export default async function DashboardPage() {
  const profile = await requireCompleteProfile();
  const myCaptions = await fetchUserCaptions(profile.id, 30);
  const generationCount = new Set(myCaptions.map((caption) => caption.generationId)).size;
  const ratingsReceived = myCaptions.reduce((sum, caption) => sum + caption.ratingCount, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Members only</p>
        <h1 className="mt-1 text-3xl font-bold">Welcome, {profile.first_name}!</h1>
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <Avatar url={profile.avatar_url} name={displayName(profile)} size={64} />
          <div>
            <p className="text-lg font-semibold">{displayName(profile)}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            <Link href="/profile" className="mt-2 inline-block text-sm underline">
              Edit your profile
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-3xl font-bold">{generationCount}</p>
          <p className="text-sm text-gray-500">moments captioned</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-3xl font-bold">{ratingsReceived}</p>
          <p className="text-sm text-gray-500">ratings on your captions</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Your captions</h2>
          <Link href="/generate" className="text-sm underline">
            Generate more
          </Link>
        </div>
        <CaptionList
          captions={myCaptions}
          viewerId={profile.id}
          showContext
          emptyMessage="You haven't captioned a moment yet."
        />
      </section>
    </main>
  );
}
