import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS, isProfileComplete } from "@/lib/profile";

function loginError(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    const reason =
      request.nextUrl.searchParams.get("error_description") ??
      "Sign-in was cancelled or failed.";
    return loginError(request, reason);
  }

  const supabase = await createClient();
  const { data: session, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return loginError(request, exchangeError.message);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", session.user.id)
    .single();
  if (profileError) {
    return loginError(request, "Signed in, but your profile could not be loaded.");
  }

  const destination = isProfileComplete(profile) ? "/dashboard" : "/onboarding";
  return NextResponse.redirect(new URL(destination, request.url));
}
