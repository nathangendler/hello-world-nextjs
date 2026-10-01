"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
      >
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
