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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-7 sm:px-8">
      <section>
        <span className="eyebrow">Members only</span>
        <h1 className="title mt-1 text-[28px] leading-tight">Welcome, {profile.first_name}!</h1>
        <div className="card mt-4 flex items-center gap-4 p-4">
          <Avatar url={profile.avatar_url} name={displayName(profile)} size={56} />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-ink">{displayName(profile)}</p>
            <p className="text-[12px] text-subtle">{profile.email}</p>
            {profile.bio && <p className="mt-1 text-[13px] text-ink">{profile.bio}</p>}
            <Link href="/profile" className="mt-2 inline-block text-[12px] font-bold text-ink underline">
              Edit your profile
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="title text-[28px]">{posted.length}</p>
          <p className="text-[12px] text-subtle">moments posted</p>
        </div>
        <div className="card p-4">
          <p className="title text-[28px]">{likes}</p>
          <p className="text-[12px] text-subtle">likes received</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Your moments</span>
          <Link href="/generate" className="btn-outline btn-sm">
            Post another
          </Link>
        </div>
        {moments.length === 0 ? (
          <p className="text-[13px] text-subtle">You haven&apos;t posted a moment yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {moments.map((moment) => (
              <li key={moment.id}>
                <Link href={`/g/${moment.id}`} className="card block overflow-hidden">
                  <Image
                    src={moment.imageUrl}
                    alt={moment.caption ?? "Unfinished moment"}
                    width={400}
                    height={400}
                    sizes="(max-width: 672px) 50vw, 220px"
                    className="aspect-square w-full bg-gray-soft object-cover"
                  />
                  <div className="p-3 text-[12px]">
                    {moment.postedAt ? (
                      <>
                        <p className="line-clamp-2 font-bold text-ink">{moment.caption}</p>
                        <p className="mt-1 text-subtle">♥ {moment.likeCount}</p>
                      </>
                    ) : (
                      <p className="font-bold text-accent-strong">Finish picking →</p>
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
