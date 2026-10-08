"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";
import { GeminiError, generateJsonArray, type GeminiImage } from "@/lib/ai/gemini";
import {
  CAPTION_COUNT,
  DAILY_GENERATION_LIMIT,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MOMENTS_BUCKET,
} from "@/lib/captions/config";
import { buildPrompt, parseCaptions } from "@/lib/captions/prompt";
import { validateGenerationInput } from "@/lib/captions/validation";

export type GenerateResult =
  | { ok: true; generationId: string }
  | { ok: false; errors: string[] };

function publicImageUrl(imagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${MOMENTS_BUCKET}/${imagePath}`;
}

async function loadImage(imagePath: string): Promise<GeminiImage> {
  const response = await fetch(publicImageUrl(imagePath));
  if (!response.ok) {
    throw new Error("The uploaded photo could not be read back.");
  }
  const mimeType = response.headers.get("content-type") ?? "";
  if (!(IMAGE_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error("The uploaded photo is not a supported image type.");
  }
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("The uploaded photo is too large.");
  }
  return { mimeType, base64: Buffer.from(bytes).toString("base64") };
}

export async function createGeneration(raw: {
  vibe: string;
  note: string;
  imagePath: string | null;
}): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, errors: ["Sign in to generate captions."] };
  }

  const validated = validateGenerationInput(raw, user.id);
  if (!validated.ok) {
    return { ok: false, errors: validated.errors };
  }
  const { vibe, note, imagePath } = validated.value;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if (countError) {
    return { ok: false, errors: [`Could not check your daily limit: ${countError.message}`] };
  }
  if ((count ?? 0) >= DAILY_GENERATION_LIMIT) {
    return {
      ok: false,
      errors: [`You've hit today's limit of ${DAILY_GENERATION_LIMIT} generations. Come back tomorrow!`],
    };
  }

  let image: GeminiImage | null = null;
  if (imagePath) {
    try {
      image = await loadImage(imagePath);
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : "Photo could not be read."] };
    }
  }

  const prompt = buildPrompt({ vibe, note, hasImage: image !== null });
  let generated: { model: string; text: string };
  try {
    generated = await generateJsonArray({ prompt, image, itemCount: CAPTION_COUNT });
  } catch (error) {
    if (error instanceof GeminiError) {
      return { ok: false, errors: [error.message] };
    }
    throw error;
  }

  const parsed = parseCaptions(generated.text);
  if (!parsed.ok) {
    return { ok: false, errors: [`The model's answer could not be used (${parsed.reason}). Try again.`] };
  }

  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      vibe,
      user_note: note,
      image_url: imagePath ? publicImageUrl(imagePath) : null,
      prompt,
      model: generated.model,
    })
    .select("id")
    .single();
  if (generationError) {
    return { ok: false, errors: [`Could not save the generation: ${generationError.message}`] };
  }

  const { error: captionsError } = await supabase.from("captions").insert(
    parsed.captions.map((text, index) => ({
      generation_id: generation.id,
      position: index + 1,
      text,
    })),
  );
  if (captionsError) {
    return { ok: false, errors: [`Could not save the captions: ${captionsError.message}`] };
  }

  revalidatePath("/", "layout");
  return { ok: true, generationId: generation.id };
}
