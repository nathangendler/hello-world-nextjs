import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { isVibe, type Vibe } from "./vibes";

export type FeedCaption = {
  id: string;
  text: string;
  position: number;
  generationId: string;
  createdAt: string;
  userId: string;
  vibe: Vibe;
  userNote: string | null;
  imageUrl: string | null;
  ratingCount: number;
  averageScore: number | null;
  weightedScore: number;
};

export type FeedSort = "top" | "new";

export function isFeedSort(value: unknown): value is FeedSort {
  return value === "top" || value === "new";
}

type FeedRow = Database["public"]["Views"]["feed_captions"]["Row"];

// Every column is nullable in the generated view type; the underlying tables are not.
function toFeedCaption(row: FeedRow): FeedCaption {
  if (
    row.id === null ||
    row.text === null ||
    row.position === null ||
    row.generation_id === null ||
    row.created_at === null ||
    row.user_id === null ||
    !isVibe(row.vibe) ||
    row.rating_count === null ||
    row.weighted_score === null
  ) {
    throw new Error(`feed_captions row ${row.id ?? "?"} is missing required columns`);
  }
  return {
    id: row.id,
    text: row.text,
    position: row.position,
    generationId: row.generation_id,
    createdAt: row.created_at,
    userId: row.user_id,
    vibe: row.vibe,
    userNote: row.user_note,
    imageUrl: row.image_url,
    ratingCount: row.rating_count,
    averageScore: row.average_score,
    weightedScore: row.weighted_score,
  };
}

export async function fetchFeed(sort: FeedSort, limit: number): Promise<FeedCaption[]> {
  const supabase = await createClient();
  let query = supabase.from("feed_captions").select("*").limit(limit);
  query =
    sort === "top"
      ? query
          .order("weighted_score", { ascending: false })
          .order("rating_count", { ascending: false })
          .order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false }).order("position");

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load the feed: ${error.message}`);
  }
  return data.map(toFeedCaption);
}

export async function fetchGenerationCaptions(generationId: string): Promise<FeedCaption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_captions")
    .select("*")
    .eq("generation_id", generationId)
    .order("position");
  if (error) {
    throw new Error(`Failed to load the generation: ${error.message}`);
  }
  return data.map(toFeedCaption);
}

export async function fetchUserCaptions(userId: string, limit: number): Promise<FeedCaption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_captions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("position")
    .limit(limit);
  if (error) {
    throw new Error(`Failed to load your captions: ${error.message}`);
  }
  return data.map(toFeedCaption);
}

// The viewer's own scores for the given captions. RLS already limits ratings to
// the signed-in user, so this is empty for anonymous visitors.
export async function fetchMyRatings(
  captionIds: string[],
  signedIn: boolean,
): Promise<Map<string, number>> {
  if (!signedIn || captionIds.length === 0) {
    return new Map();
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("caption_id, score")
    .in("caption_id", captionIds);
  if (error) {
    throw new Error(`Failed to load your ratings: ${error.message}`);
  }
  return new Map(data.map((row) => [row.caption_id, row.score]));
}
