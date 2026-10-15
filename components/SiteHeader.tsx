import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { displayName } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-hairline bg-cream">
      <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3 text-[13px] sm:px-8">
        <Link href="/" className="font-extrabold tracking-[-0.02em] text-ink">
          Home
        </Link>
        <Link href="/generate" className="font-semibold text-subtle hover:text-ink">
          Post a moment
        </Link>
        {profile && (
          <Link href="/dashboard" className="font-semibold text-subtle hover:text-ink">
            Dashboard
          </Link>
        )}
        <div className="ml-auto flex items-center gap-4">
          {profile ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 font-semibold text-ink">
                <Avatar url={profile.avatar_url} name={displayName(profile)} size={26} />
                <span className="hidden sm:inline">{displayName(profile)}</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-subtle hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-outline btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
