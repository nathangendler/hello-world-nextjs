"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LikeResult = { ok: true; liked: boolean } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function toggleLike(postId: string, liked: boolean): Promise<LikeResult> {
  if (!UUID.test(postId)) {
    return { ok: false, error: "Unknown post." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to like posts." };
  }

  const { error } = liked
    ? await supabase.from("likes").insert({ generation_id: postId, user_id: user.id })
    : await supabase.from("likes").delete().eq("generation_id", postId).eq("user_id", user.id);
  if (error) {
    return { ok: false, error: `Could not save your like: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { ok: true, liked };
}
