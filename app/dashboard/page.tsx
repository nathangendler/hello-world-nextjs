import Link from "next/link";
import { requireCompleteProfile } from "@/lib/auth";
import { displayName } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";

export default async function DashboardPage() {
  const profile = await requireCompleteProfile();

  return (
    <main className="mx-auto w-full max-w-xl p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
        Members only
      </p>
      <h1 className="mt-1 text-3xl font-bold">Welcome, {profile.first_name}!</h1>
      <p className="mt-2 text-gray-500">
        This page is only visible when you are signed in.
      </p>

      <section className="mt-6 flex items-center gap-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        <Avatar url={profile.avatar_url} name={displayName(profile)} size={64} />
        <div>
          <p className="text-lg font-semibold">{displayName(profile)}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
      </section>

      <Link href="/profile" className="mt-6 inline-block text-sm underline">
        Edit your profile
      </Link>
    </main>
  );
}
