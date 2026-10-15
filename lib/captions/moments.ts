import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Pick } from "./bracket";

export type Post = {
  id: string;
  userId: string;
  userNote: string | null;
  imageUrl: string;
  postedAt: string;
  caption: string;
  likeCount: number;
};

export type PostSort = "new" | "top";

export function isPostSort(value: unknown): value is PostSort {
  return value === "new" || value === "top";
}

export type Caption = { id: string; position: number; text: string };

// A moment the viewer owns, in whatever stage it is in.
export type Moment = {
  id: string;
  userId: string;
  userNote: string | null;
  imageUrl: string;
  createdAt: string;
  postedAt: string | null;
  winnerCaptionId: string | null;
  captions: Caption[];
  picks: Pick[];
};

type PostRow = Database["public"]["Views"]["posts"]["Row"];

// Every column is nullable in the generated view type; the underlying tables are not.
function toPost(row: PostRow): Post {
  if (
    row.id === null ||
    row.user_id === null ||
    row.image_url === null ||
    row.posted_at === null ||
    row.caption === null ||
    row.like_count === null
  ) {
    throw new Error(`posts row ${row.id ?? "?"} is missing required columns`);
  }
  return {
    id: row.id,
    userId: row.user_id,
    userNote: row.user_note,
    imageUrl: row.image_url,
    postedAt: row.posted_at,
    caption: row.caption,
    likeCount: row.like_count,
  };
}

export async function fetchPosts(sort: PostSort, limit: number): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase.from("posts").select("*").limit(limit);
  query =
    sort === "top"
      ? query.order("like_count", { ascending: false }).order("posted_at", { ascending: false })
      : query.order("posted_at", { ascending: false });
  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load posts: ${error.message}`);
  }
  return data.map(toPost);
}

export async function fetchPost(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(`Failed to load the post: ${error.message}`);
  }
  return data ? toPost(data) : null;
}

// Full moment with captions and picks. RLS means a non-owner only gets posted moments.
export async function fetchMoment(id: string): Promise<Moment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, user_id, user_note, image_url, created_at, posted_at, winner_caption_id, captions!captions_generation_id_fkey(id, position, text), picks(pick_index, winner_caption_id, loser_caption_id)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load the moment: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    userId: data.user_id,
    userNote: data.user_note,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    postedAt: data.posted_at,
    winnerCaptionId: data.winner_caption_id,
    captions: [...data.captions].sort((a, b) => a.position - b.position),
    picks: [...data.picks]
      .sort((a, b) => a.pick_index - b.pick_index)
      .map((pick) => ({ winnerId: pick.winner_caption_id, loserId: pick.loser_caption_id })),
  };
}

export type MyMoment = {
  id: string;
  imageUrl: string;
  createdAt: string;
  postedAt: string | null;
  caption: string | null;
  likeCount: number;
};

export async function fetchMyMoments(userId: string, limit: number): Promise<MyMoment[]> {
  const supabase = await createClient();
  const [{ data: moments, error }, { data: posts, error: postsError }] = await Promise.all([
    supabase
      .from("generations")
      .select("id, image_url, created_at, posted_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("posts").select("id, caption, like_count").eq("user_id", userId),
  ]);
  if (error) {
    throw new Error(`Failed to load your moments: ${error.message}`);
  }
  if (postsError) {
    throw new Error(`Failed to load your posts: ${postsError.message}`);
  }
  const byId = new Map(posts.map((post) => [post.id, post]));
  return moments.map((moment) => {
    const post = byId.get(moment.id);
    return {
      id: moment.id,
      imageUrl: moment.image_url,
      createdAt: moment.created_at,
      postedAt: moment.posted_at,
      caption: post?.caption ?? null,
      likeCount: post?.like_count ?? 0,
    };
  });
}

// Which of the given posts the viewer has liked. RLS limits likes to the viewer's own rows.
export async function fetchMyLikes(postIds: string[], signedIn: boolean): Promise<Set<string>> {
  if (!signedIn || postIds.length === 0) {
    return new Set();
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("likes")
    .select("generation_id")
    .in("generation_id", postIds);
  if (error) {
    throw new Error(`Failed to load your likes: ${error.message}`);
  }
  return new Set(data.map((row) => row.generation_id));
}
