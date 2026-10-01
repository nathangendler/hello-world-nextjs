import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-5xl font-bold">Hello World</h1>
      <Link href="/albums" className="text-lg underline">
        View albums from Supabase
      </Link>
      {profile ? (
        <Link href="/dashboard" className="text-lg underline">
          Go to your dashboard
        </Link>
      ) : (
        <Link href="/login" className="text-lg underline">
          Sign in with Google
        </Link>
      )}
    </main>
  );
}
