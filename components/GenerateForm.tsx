"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createMoment } from "@/lib/actions/generate";
import {
  CAPTION_COUNT,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_NOTE_LENGTH,
  MOMENTS_BUCKET,
} from "@/lib/captions/config";
import { downscaleImage } from "@/lib/captions/images";

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "generating" }
  | { kind: "failed"; errors: string[] };

export function GenerateForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "uploading" || status.kind === "generating";

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: string[] = [];
    if (!photo) {
      errors.push("Add a photo first.");
    } else if (!(IMAGE_TYPES as readonly string[]).includes(photo.type)) {
      errors.push("Photo must be a JPEG, PNG, or WebP.");
    } else if (photo.size > MAX_IMAGE_BYTES * 4) {
      errors.push("Photo must be 20 MB or smaller.");
    }
    if (note.trim().length > MAX_NOTE_LENGTH) {
      errors.push(`Keep the note under ${MAX_NOTE_LENGTH} characters.`);
    }
    if (errors.length > 0 || !photo) {
      setStatus({ kind: "failed", errors });
      return;
    }

    setStatus({ kind: "uploading" });
    const upload = await downscaleImage(photo);
    if (upload.size > MAX_IMAGE_BYTES) {
      setStatus({ kind: "failed", errors: ["Photo is still over 5 MB after resizing. Try a smaller one."] });
      return;
    }
    const supabase = createClient();
    const extension = upload.type === "image/png" ? "png" : upload.type === "image/webp" ? "webp" : "jpg";
    const imagePath = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(MOMENTS_BUCKET)
      .upload(imagePath, upload, { contentType: upload.type });
    if (error) {
      setStatus({ kind: "failed", errors: [`Photo upload failed: ${error.message}`] });
      return;
    }

    setStatus({ kind: "generating" });
    let result: Awaited<ReturnType<typeof createMoment>>;
    try {
      result = await createMoment({ note, imagePath });
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
    router.push(`/g/${result.momentId}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-6">
      <div>
        <label
          htmlFor="photo"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Your photo"
              width={640}
              height={480}
              unoptimized
              className="max-h-80 w-auto rounded-xl object-contain"
            />
          ) : (
            <>
              <span className="text-3xl" aria-hidden>
                📷
              </span>
              <span className="font-medium">Choose a photo</span>
              <span className="text-sm text-gray-500">JPEG, PNG, or WebP</span>
            </>
          )}
          {preview && <span className="text-sm text-gray-500">Tap to change</span>}
        </label>
        <input
          id="photo"
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-medium">
          Anything the caption should say?{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          placeholder="e.g. something about how I waited 40 minutes for this bagel"
          className="mt-1 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        <p className="mt-1 text-xs text-gray-500">
          {note.length}/{MAX_NOTE_LENGTH}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={busy || !photo}
          className="w-full rounded-xl bg-foreground px-5 py-3 text-base font-semibold text-background disabled:opacity-50 sm:w-auto"
        >
          {status.kind === "uploading"
            ? "Uploading photo…"
            : status.kind === "generating"
              ? "Writing captions…"
              : `Generate ${CAPTION_COUNT} captions`}
        </button>
        <p className="text-xs text-gray-500">
          You&apos;ll pick your favorite head-to-head until one caption is left. That one gets posted.
        </p>
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
