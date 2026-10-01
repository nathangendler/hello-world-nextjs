import type { Database } from "@/lib/supabase/database.types";

export type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "first_name" | "last_name" | "bio" | "avatar_url"
>;

export const PROFILE_COLUMNS = "id, email, first_name, last_name, bio, avatar_url";

export function isProfileComplete(profile: Profile): boolean {
  return Boolean(profile.first_name?.trim() && profile.last_name?.trim());
}

export function displayName(profile: Profile): string {
  const fullName = [profile.first_name, profile.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return fullName || profile.email || "Member";
}
