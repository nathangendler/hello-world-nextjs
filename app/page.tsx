import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">Hello World</h1>
      <Link href="/albums" className="text-lg underline">
        View albums from Supabase
      </Link>
    </main>
  );
}
