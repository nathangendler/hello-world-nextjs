import Link from "next/link";
import { supabase, type Album } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const { data, error } = await supabase
    .from("albums")
    .select("id, title, artist, year, rating")
    .order("rating", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-3xl font-bold">Albums</h1>
        <p className="mt-4 text-red-600">Failed to load albums: {error.message}</p>
      </main>
    );
  }

  const albums = (data ?? []) as Album[];

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Albums</h1>
      <p className="mt-1 text-sm text-gray-500">
        {albums.length} rows loaded from Supabase
      </p>
      <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {albums.map((album) => (
          <li key={album.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{album.title}</p>
              <p className="text-sm text-gray-500">
                {album.artist} · {album.year}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900">
              {album.rating}/10
            </span>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-6 inline-block text-sm underline">
        Back home
      </Link>
    </main>
  );
}
