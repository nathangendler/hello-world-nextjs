"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ladderState, isPickFor, type LadderState } from "@/lib/captions/ladder";
import { fetchMoment } from "@/lib/captions/moments";

export type PickResult =
  | { ok: true; state: LadderState }
  | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Records one ladder pick. The ladder is replayed from stored picks so a stale
// or forged pick is rejected; the seventh pick posts the moment with its champion.
export async function recordPick(input: {
  momentId: string;
  winnerId: string;
  loserId: string;
}): Promise<PickResult> {
  if (!UUID.test(input.momentId) || !UUID.test(input.winnerId) || !UUID.test(input.loserId)) {
    return { ok: false, error: "Unknown caption." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to pick captions." };
  }

  const moment = await fetchMoment(input.momentId);
  if (!moment || moment.userId !== user.id) {
    return { ok: false, error: "This moment isn't yours to pick for." };
  }
  if (moment.postedAt) {
    return { ok: false, error: "This moment has already been posted." };
  }

  const current = ladderState(
    moment.captions.map((caption) => caption.id),
    moment.picks,
  );
  if (current.kind !== "picking") {
    return { ok: false, error: "This moment's picks are already finished." };
  }
  const pick = { winnerId: input.winnerId, loserId: input.loserId };
  if (!isPickFor(pick, current.pair)) {
    return { ok: false, error: "That pair isn't up right now. Refresh and try again." };
  }

  const { error: pickError } = await supabase.from("picks").insert({
    generation_id: moment.id,
    user_id: user.id,
    pick_index: current.pickIndex,
    winner_caption_id: pick.winnerId,
    loser_caption_id: pick.loserId,
  });
  if (pickError) {
    return { ok: false, error: `Could not save your pick: ${pickError.message}` };
  }

  const next = ladderState(
    moment.captions.map((caption) => caption.id),
    [...moment.picks, pick],
  );
  if (next.kind === "done") {
    const { error: postError } = await supabase
      .from("generations")
      .update({ winner_caption_id: next.championId, posted_at: new Date().toISOString() })
      .eq("id", moment.id);
    if (postError) {
      return { ok: false, error: `Could not post your moment: ${postError.message}` };
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, state: next };
}
