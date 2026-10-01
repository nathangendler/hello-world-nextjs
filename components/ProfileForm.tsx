"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { displayName, type Profile } from "@/lib/profile";
import { Avatar } from "@/components/Avatar";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type FieldErrors = { firstName?: string; lastName?: string; photo?: string };

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "failed"; message: string };

function validate(
  firstName: string,
  lastName: string,
  photo: File | null,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!firstName.trim()) errors.firstName = "First name is required.";
  if (!lastName.trim()) errors.lastName = "Last name is required.";
  if (photo && !PHOTO_TYPES.includes(photo.type)) {
    errors.photo = "Photo must be a JPEG, PNG, WebP, or GIF.";
  } else if (photo && photo.size > MAX_PHOTO_BYTES) {
    errors.photo = "Photo must be 5 MB or smaller.";
  }
  return errors;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2";

export function ProfileForm({
  profile,
  submitLabel,
  redirectTo,
}: {
  profile: Profile;
  submitLabel: string;
  // Where to go after a successful save; null stays on the page.
  redirectTo: string | null;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validate(firstName, lastName, photo);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "saving" });
    const supabase = createClient();
    let avatarUrl = profile.avatar_url;

    if (photo) {
      // One object per user; the version query busts the CDN cache on replace.
      const path = `${profile.id}/avatar`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, photo, { upsert: true, contentType: photo.type });
      if (error) {
        setStatus({ kind: "failed", message: `Photo upload failed: ${error.message}` });
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);
    if (error) {
      setStatus({ kind: "failed", message: `Could not save profile: ${error.message}` });
      return;
    }

    setPhoto(null);
    setPhotoInputKey((key) => key + 1);
    setStatus({ kind: "saved" });
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatar_url} name={displayName(profile)} size={72} />
        <div className="flex-1">
          <label htmlFor="photo" className="text-sm font-medium">
            Profile photo
          </label>
          <input
            key={photoInputKey}
            id="photo"
            type="file"
            accept={PHOTO_TYPES.join(",")}
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-gray-900"
          />
          {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="first-name" className="text-sm font-medium">
            First name
          </label>
          <input
            id="first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            className={inputClass}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="last-name" className="text-sm font-medium">
            Last name
          </label>
          <input
            id="last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            className={inputClass}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          maxLength={280}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status.kind === "saving"}
          className="rounded-lg bg-foreground px-5 py-2.5 font-medium text-background disabled:opacity-60"
        >
          {status.kind === "saving" ? "Saving…" : submitLabel}
        </button>
        {status.kind === "saved" && <p className="text-sm text-green-600">Saved.</p>}
        {status.kind === "failed" && (
          <p className="text-sm text-red-600">{status.message}</p>
        )}
      </div>
    </form>
  );
}
