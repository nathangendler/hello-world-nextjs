import { requireCompleteProfile } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/provider";
import { GenerateForm } from "@/components/GenerateForm";

export default async function GeneratePage() {
  const profile = await requireCompleteProfile();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-8">
      <span className="eyebrow">New moment</span>
      <h1 className="title mt-1 text-[28px] leading-tight">Post a moment</h1>
      <p className="mt-1 text-[14px] text-subtle">
        Add a photo. You&apos;ll get eight captions and pick your favorite.
      </p>
      {!isAiConfigured() && (
        <p role="alert" className="card mt-4 border-accent px-4 py-2 text-[13px] text-ink">
          Caption generation is not configured on this deployment yet (no valid GROQ_API_KEY or GEMINI_API_KEY).
        </p>
      )}
      <GenerateForm userId={profile.id} />
    </main>
  );
}
