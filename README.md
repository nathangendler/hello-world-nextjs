# Caption the City

AI-written captions for your New York City moments, rated by everyone. A Next.js app
deployed on Vercel from GitHub, backed by Supabase (Postgres, Auth, Storage) and Google
Gemini.

## What it does

- **Generate** (`/generate`, signed in): add a note and/or a photo of a moment, pick a vibe
  (Hype, Roast, Poetic, Midwest Mom), and get three captions. The photo, the note, the
  full prompt sent to the model, the model name, and the captions are all saved.
- **Rate** (anywhere captions appear, signed in): score any caption 1 to 10, Jukebox style.
  One score per person per caption; rating again replaces your score.
- **Feed** (`/feed`, public): captions ranked by a weighted score that pulls captions with few
  ratings toward 5, so one 10/10 can't top the chart. "New" shows the latest moments.
- **Daily prompt** (home and generate pages): a rotating NYC-themed prompt gives people a
  reason to come back and something specific to post about.
- **Dashboard** (`/dashboard`, signed in): your moments and how many ratings they've earned.
- Also: `/login` with Google, `/onboarding` for first and last name, `/profile` to edit
  name, bio, and photo, `/albums` from the first assignment.

## Product notes

The persona is Sam: a Columbia junior from the Midwest, chronically online, exploring the
city on weekends.

- **Why come back daily?** A new NYC prompt every day, a "Top rated right now" board that
  changes as people vote, and a copy button so a caption goes straight to Sam's post.
- **How does it become a content source?** Every moment page (`/g/<id>`) is public and
  shareable without an account. Reading and rating are two clicks; writing is three
  captions for the price of one note. Captions compete anonymously, so the feed rewards the
  funniest line rather than the most popular person.
- **What would make Crackd better, and how does it apply here?** Two things: a stated vibe
  (the user controls the voice instead of rerolling), and community ranking that feeds back
  into what's shown first. Both are built in here, and the prompt plus the vibe are stored
  with every generation so the best-rated styles can be studied later.

## Security

Row-level security is on for every table. Anyone can read generations and captions. Only the
signed-in owner can insert generations and their captions. Rating rows are private to the
person who made them; the public only sees aggregates through the `caption_scores` view.
Table privileges for `anon` and `authenticated` are cut down to what the app uses. Photo
uploads are limited to the uploader's own folder, 5 MB, and image types only.

## Setup

Copy `.env.example` to `.env.local` and fill in the Supabase URL, anon key, and a Gemini API
key (or a Groq key, which has a free plan). Database setup, in order: `supabase-schema.sql` (albums), `supabase-profiles.sql`
(profiles, new-user trigger, avatars), `supabase-captions.sql` (generations, captions,
ratings, score views, moments bucket). `scripts/sql.sh "<sql>"` runs SQL against the project
using the Supabase CLI login.

```bash
npm run dev        # http://localhost:3000
npm test           # unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run lint
```
