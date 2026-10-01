import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS, isProfileComplete, type Profile } from "@/lib/profile";

// Returns the signed-in user's profile, or null when nobody is signed in.
// Cached per request so the header and the page share one lookup.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
});

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

// For gated pages: signed in AND first/last name filled in.
export async function requireCompleteProfile(): Promise<Profile> {
  const profile = await requireProfile();
  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }
  return profile;
}
