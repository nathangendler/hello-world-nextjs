import { requireCompleteProfile } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { MAX_NOTE_LENGTH } from "@/lib/captions/config";
import { DailyPromptCard } from "@/components/DailyPromptCard";
import { GenerateForm } from "@/components/GenerateForm";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string }>;
}) {
  const [profile, { note }] = await Promise.all([requireCompleteProfile(), searchParams]);
  const initialNote = (note ?? "").slice(0, MAX_NOTE_LENGTH);

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Generate captions</h1>
      <p className="mt-2 text-gray-500">
        Describe the moment, add a photo if you have one, and pick a vibe.
      </p>
      {!isGeminiConfigured() && (
        <p role="alert" className="mt-4 rounded-lg border border-amber-400 px-4 py-2 text-sm text-amber-700">
          Caption generation is not configured on this deployment yet (GEMINI_API_KEY is missing).
        </p>
      )}
      <div className="mt-6">
        <DailyPromptCard showCta={false} />
      </div>
      <GenerateForm userId={profile.id} initialNote={initialNote} />
    </main>
  );
}
