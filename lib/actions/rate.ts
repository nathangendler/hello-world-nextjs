"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAX_SCORE, MIN_SCORE } from "@/lib/captions/config";

export type RateResult = { ok: true; score: number } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function rateCaption(captionId: string, score: number): Promise<RateResult> {
  if (!UUID.test(captionId)) {
    return { ok: false, error: "Unknown caption." };
  }
  if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
    return { ok: false, error: `Score must be a whole number from ${MIN_SCORE} to ${MAX_SCORE}.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to rate captions." };
  }

  // One rating per user per caption: a repeat vote replaces the earlier score.
  const { error } = await supabase
    .from("ratings")
    .upsert({ caption_id: captionId, user_id: user.id, score }, { onConflict: "caption_id,user_id" });
  if (error) {
    return { ok: false, error: `Could not save your rating: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { ok: true, score };
}
