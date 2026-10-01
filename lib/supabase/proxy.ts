import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/onboarding"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Validates the token with Supabase and refreshes it when it has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const redirectPath =
    !user && isProtected(pathname)
      ? "/login"
      : user && pathname === "/login"
        ? "/dashboard"
        : null;

  if (redirectPath === null) {
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = redirectPath;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  // Carry over any refreshed session cookies so the session is not dropped.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
