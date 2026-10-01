# hello-world-nextjs

A Next.js app deployed on Vercel from GitHub, backed by Supabase.

- `/albums` lists rows from a Supabase table (public).
- `/login` signs in with Google through Supabase Auth; the OAuth redirect lands on `/auth/callback`.
- `/onboarding` asks new users for their first and last name.
- `/dashboard` is only available when signed in.
- `/profile` lets a user edit their name and bio and upload a photo.

## Setup

Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key.
Database setup lives in `supabase-schema.sql` (albums) and `supabase-profiles.sql`
(profiles table, new-user trigger, avatar storage). `scripts/sql.sh "<sql>"` runs SQL
against the project using the Supabase CLI login.
