"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createGeneration } from "@/lib/actions/generate";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_NOTE_LENGTH,
  MOMENTS_BUCKET,
} from "@/lib/captions/config";
import { validateGenerationInput } from "@/lib/captions/validation";
import { VIBES, VIBE_DETAILS, type Vibe } from "@/lib/captions/vibes";

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "generating" }
  | { kind: "failed"; errors: string[] };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function GenerateForm({
  userId,
  initialNote,
}: {
  userId: string;
  initialNote: string;
}) {
  const router = useRouter();
  const [vibe, setVibe] = useState<Vibe>("hype");
  const [note, setNote] = useState(initialNote);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "uploading" || status.kind === "generating";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: string[] = [];
    if (photo && !(IMAGE_TYPES as readonly string[]).includes(photo.type)) {
      errors.push("Photo must be a JPEG, PNG, or WebP.");
    } else if (photo && photo.size > MAX_IMAGE_BYTES) {
      errors.push("Photo must be 5 MB or smaller.");
    }
    // Validate text fields before uploading; a placeholder path stands in for the photo.
    const preview = validateGenerationInput(
      { vibe, note, imagePath: photo ? `${userId}/${crypto.randomUUID()}.jpg` : null },
      userId,
    );
    if (!preview.ok) {
      errors.push(...preview.errors);
    }
    if (errors.length > 0) {
      setStatus({ kind: "failed", errors });
      return;
    }

    let imagePath: string | null = null;
    if (photo) {
      setStatus({ kind: "uploading" });
      const supabase = createClient();
      imagePath = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[photo.type]}`;
      const { error } = await supabase.storage
        .from(MOMENTS_BUCKET)
        .upload(imagePath, photo, { contentType: photo.type });
      if (error) {
        setStatus({ kind: "failed", errors: [`Photo upload failed: ${error.message}`] });
        return;
      }
    }

    setStatus({ kind: "generating" });
    let result: Awaited<ReturnType<typeof createGeneration>>;
    try {
      result = await createGeneration({ vibe, note, imagePath });
    } catch {
      setStatus({
        kind: "failed",
        errors: ["Something went wrong on the server while generating. Please try again."],
      });
      return;
    }
    if (!result.ok) {
      setStatus({ kind: "failed", errors: result.errors });
      return;
    }
    router.push(`/g/${result.generationId}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-6">
      <fieldset>
        <legend className="text-sm font-medium">Vibe</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VIBES.map((option) => {
            const selected = vibe === option;
            return (
              <label
                key={option}
                className={`cursor-pointer rounded-lg border p-3 text-sm ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="vibe"
                  value={option}
                  checked={selected}
                  onChange={() => setVibe(option)}
                  className="sr-only"
                />
                <span className="block font-semibold">{VIBE_DETAILS[option].label}</span>
                <span className={selected ? "opacity-80" : "text-gray-500"}>
                  {VIBE_DETAILS[option].blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="note" className="text-sm font-medium">
          What&apos;s the moment?
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={MAX_NOTE_LENGTH}
          placeholder="e.g. first time on the Staten Island Ferry, it was free and I was not emotionally prepared"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        <p className="mt-1 text-xs text-gray-500">
          {note.length}/{MAX_NOTE_LENGTH}
        </p>
      </div>

      <div>
        <label htmlFor="photo" className="text-sm font-medium">
          Photo <span className="text-gray-500">(optional, but captions get way better)</span>
        </label>
        <input
          id="photo"
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-gray-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-lg bg-foreground px-5 py-2.5 font-medium text-background disabled:opacity-60"
        >
          {status.kind === "uploading"
            ? "Uploading photo…"
            : status.kind === "generating"
              ? "Writing captions…"
              : "Generate 3 captions"}
        </button>
        {status.kind === "failed" && (
          <ul className="list-disc pl-5 text-sm text-red-600">
            {status.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
