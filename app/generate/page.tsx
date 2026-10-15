import { requireCompleteProfile } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/provider";
import { DailyPromptCard } from "@/components/DailyPromptCard";
import { GenerateForm } from "@/components/GenerateForm";

export default async function GeneratePage() {
  const profile = await requireCompleteProfile();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Post a moment</h1>
      <p className="mt-2 text-gray-500">
        Add a photo. You&apos;ll get eight captions and pick your favorite.
      </p>
      {!isAiConfigured() && (
        <p role="alert" className="mt-4 rounded-lg border border-amber-400 px-4 py-2 text-sm text-amber-700">
          Caption generation is not configured on this deployment yet (no valid GROQ_API_KEY or GEMINI_API_KEY).
        </p>
      )}
      <div className="mt-6">
        <DailyPromptCard showCta={false} />
      </div>
      <GenerateForm userId={profile.id} />
    </main>
  );
}
