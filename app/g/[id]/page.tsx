import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { fetchGenerationCaptions } from "@/lib/captions/feed";
import { VIBE_DETAILS } from "@/lib/captions/vibes";
import { CaptionList } from "@/components/CaptionList";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }
  const [profile, captions] = await Promise.all([
    getCurrentProfile(),
    fetchGenerationCaptions(id),
  ]);
  if (captions.length === 0) {
    notFound();
  }
  const moment = captions[0];
  const isMine = profile?.id === moment.userId;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {VIBE_DETAILS[moment.vibe].label}
          </span>
          {isMine && <span>Your moment</span>}
          <span>{new Date(moment.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
        </div>
        {moment.imageUrl && (
          <Image
            src={moment.imageUrl}
            alt={moment.userNote ?? "The moment"}
            width={640}
            height={480}
            className="max-h-96 w-full rounded-xl object-cover"
          />
        )}
        {moment.userNote && <p className="text-lg">{moment.userNote}</p>}
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Three captions. Rate them.</h1>
        <CaptionList
          captions={captions}
          viewerId={profile?.id ?? null}
          showContext={false}
          emptyMessage="No captions."
        />
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/generate" className="underline">
          Caption another moment
        </Link>
        <Link href="/feed" className="underline">
          Back to the feed
        </Link>
      </div>
    </main>
  );
}
