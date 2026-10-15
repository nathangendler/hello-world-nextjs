import Link from "next/link";
import { supabaseAnon, type Album } from "@/lib/supabase/anon";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const { data, error } = await supabaseAnon
    .from("albums")
    .select("*")
    .order("rating", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-7 sm:px-8">
        <h1 className="title text-[28px]">Albums</h1>
        <p className="mt-4 text-[13px] text-danger">Failed to load albums: {error.message}</p>
      </main>
    );
  }

  const albums: Album[] = data ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-7 sm:px-8">
      <span className="eyebrow">Supabase demo</span>
      <h1 className="title mt-1 text-[28px]">Albums</h1>
      <p className="mt-1 text-[12px] text-subtle">
        {albums.length} rows loaded from Supabase
      </p>
      <ul className="card mt-5 divide-y divide-hairline">
        {albums.map((album) => (
          <li key={album.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-extrabold text-ink">{album.title}</p>
              <p className="text-[12px] text-subtle">
                {album.artist} · {album.year}
              </p>
            </div>
            <span className="rounded-full border border-ink px-3 py-1 text-[12px] font-bold text-ink">
              {album.rating}/10
            </span>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn-outline btn-sm mt-5">
        Back home
      </Link>
    </main>
  );
}
