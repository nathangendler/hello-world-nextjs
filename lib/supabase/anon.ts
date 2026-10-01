import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Cookie-less client for public data. It always acts as the `anon` role,
// regardless of whether the visitor is signed in.
export const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Album = Database["public"]["Tables"]["albums"]["Row"];
