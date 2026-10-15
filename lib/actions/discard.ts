"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MOMENTS_BUCKET } from "@/lib/captions/config";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type DiscardResult = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storagePath(imageUrl: string): string | null {
  const marker = `/${MOMENTS_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  return index < 0 ? null : imageUrl.slice(index + marker.length);
}

// Deletes every unposted moment the user has, photos included. RLS only lets an
// owner delete drafts, so a posted moment can never be removed this way.
export async function deleteDrafts(supabase: Supabase, userId: string): Promise<void> {
  const { data: drafts, error } = await supabase
    .from("generations")
    .select("id, image_url")
    .eq("user_id", userId)
    .is("posted_at", null);
  if (error) {
    throw new Error(`Could not look up unfinished moments: ${error.message}`);
  }
  if (drafts.length === 0) {
    return;
  }

  const paths = drafts
    .map((draft) => storagePath(draft.image_url))
    .filter((path): path is string => path !== null);
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(MOMENTS_BUCKET).remove(paths);
    if (storageError) {
      throw new Error(`Could not remove draft photos: ${storageError.message}`);
    }
  }

  const { error: deleteError } = await supabase
    .from("generations")
    .delete()
    .in(
      "id",
      drafts.map((draft) => draft.id),
    );
  if (deleteError) {
    throw new Error(`Could not discard unfinished moments: ${deleteError.message}`);
  }
}

export async function discardDrafts(): Promise<DiscardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in first." };
  }
  try {
    await deleteDrafts(supabase, user.id);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not discard." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function discardDraft(momentId: string): Promise<DiscardResult> {
  if (!UUID.test(momentId)) {
    return { ok: false, error: "Unknown moment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in first." };
  }

  const { data: draft, error } = await supabase
    .from("generations")
    .select("id, image_url, posted_at")
    .eq("id", momentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    return { ok: false, error: `Could not load the moment: ${error.message}` };
  }
  if (!draft || draft.posted_at) {
    return { ok: false, error: "Only an unfinished moment can be discarded." };
  }

  const path = storagePath(draft.image_url);
  if (path) {
    const { error: storageError } = await supabase.storage.from(MOMENTS_BUCKET).remove([path]);
    if (storageError) {
      return { ok: false, error: `Could not remove the photo: ${storageError.message}` };
    }
  }
  const { error: deleteError } = await supabase.from("generations").delete().eq("id", draft.id);
  if (deleteError) {
    return { ok: false, error: `Could not discard the moment: ${deleteError.message}` };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
