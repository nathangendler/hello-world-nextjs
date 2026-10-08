import Link from "next/link";
import { dailyPrompt } from "@/lib/captions/dailyPrompt";

export function DailyPromptCard({ showCta }: { showCta: boolean }) {
  const prompt = dailyPrompt(new Date());
  return (
    <section className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Today&apos;s prompt
      </p>
      <p className="mt-1 text-lg font-semibold">{prompt}</p>
      {showCta && (
        <Link
          href={`/generate?note=${encodeURIComponent(prompt)}`}
          className="mt-2 inline-block text-sm underline"
        >
          Caption this moment
        </Link>
      )}
    </section>
  );
}
