import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { displayName } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-3xl items-center gap-5 px-6 py-3 text-sm">
        <Link href="/" className="font-semibold">
          Caption the City
        </Link>
        <Link href="/feed">Feed</Link>
        <Link href="/generate">Generate</Link>
        {profile && <Link href="/dashboard">Dashboard</Link>}
        <div className="ml-auto flex items-center gap-4">
          {profile ? (
            <>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar url={profile.avatar_url} name={displayName(profile)} size={28} />
                <span>{displayName(profile)}</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
