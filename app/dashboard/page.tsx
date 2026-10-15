import Image from "next/image";
import Link from "next/link";
import { requireCompleteProfile } from "@/lib/auth";
import { fetchMyMoments } from "@/lib/captions/moments";
import { displayName } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";

export default async function DashboardPage() {
  const profile = await requireCompleteProfile();
  const moments = await fetchMyMoments(profile.id, 30);
  const posted = moments.filter((moment) => moment.postedAt !== null);
  const likes = posted.reduce((sum, moment) => sum + moment.likeCount, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Members only</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome, {profile.first_name}!</h1>
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
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
        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-3xl font-bold">{posted.length}</p>
          <p className="text-sm text-gray-500">moments posted</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-3xl font-bold">{likes}</p>
          <p className="text-sm text-gray-500">likes received</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Your moments</h2>
          <Link href="/generate" className="text-sm underline">
            Post another
          </Link>
        </div>
        {moments.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t posted a moment yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {moments.map((moment) => (
              <li key={moment.id}>
                <Link
                  href={`/g/${moment.id}`}
                  className="block overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
                >
                  <Image
                    src={moment.imageUrl}
                    alt={moment.caption ?? "Unfinished moment"}
                    width={400}
                    height={400}
                    sizes="(max-width: 672px) 50vw, 220px"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-3 text-sm">
                    {moment.postedAt ? (
                      <>
                        <p className="line-clamp-2">{moment.caption}</p>
                        <p className="mt-1 text-xs text-gray-500">♥ {moment.likeCount}</p>
                      </>
                    ) : (
                      <p className="font-medium text-amber-700">Finish picking →</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
