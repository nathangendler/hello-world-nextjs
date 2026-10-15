# Caption This

AI-written captions for your photos, picked head-to-head. A Next.js app
deployed on Vercel from GitHub, backed by Supabase (Postgres, Auth, Storage) and Google
Gemini.

## What it does

- **Post a moment** (`/generate`, signed in): upload a photo and, optionally, a line about what
  the caption should say. The AI writes eight captions. You pick head-to-head, Jukebox style:
  the winner stays on and the next caption takes the loser's spot, until all eight have had a
  turn (7 picks). The last one standing is posted with your photo. Each pick is saved as you
  go, so an unfinished ladder can be resumed from the dashboard.
- **Moments** (`/`, public): posted photos with their winning caption, newest or most liked.
  Signed-in users can like a moment once; the copy button puts the caption on your clipboard.
- **Dashboard** (`/dashboard`, signed in): your posted moments, likes received, and any
  bracket you still need to finish.
- Also: `/login` with Google, `/onboarding` for first and last name, `/profile` to edit name,
  bio, and photo, `/albums` from the first assignment.

Every generation stores the photo URL, the user's note, the full prompt sent to the model,
the model name, all eight captions, every bracket pick, and the winner.

## Product notes

The persona is Sam: a Columbia junior from the Midwest, chronically online, exploring the
city on weekends.

- **Why come back daily?** Sam takes photos every weekend and needs captions for them. The ladder turns "pick a caption" into a 30-second game, and the feed shows what everyone
  else posted.
- **How does it become a content source?** Every posted moment is a public, shareable page.
  Reading and liking take one tap; posting is one photo. The feed only ever shows a caption
  its owner chose over seven others, so the quality bar is set by the users, not the model.
- **What would make Crackd better, and how does it apply here?** Crackd hands you captions
  and stops. Here the user's taste is the product: they choose, the choice is recorded, and
  only the winner is published. The losing captions and the picks are kept, so the best-liked
  styles can be studied later.

## Security

Row-level security is on for every table. Unposted moments and their captions are visible
only to their owner; posted moments are public. Only the owner can insert picks, and only on
an unposted moment of theirs; only a caption from that moment can be posted as its winner.
Like rows are private to the person who made them, and the public sees totals through the
`like_counts` view. Table privileges for `anon` and `authenticated` are cut down to what the
app uses. Photo uploads are limited to the uploader's own folder, 5 MB, and image types only.

## Setup

Copy `.env.example` to `.env.local` and fill in the Supabase URL, anon key, and a Gemini API
key (or a Groq key, which has a free plan). Database setup, in order: `supabase-schema.sql` (albums), `supabase-profiles.sql`
(profiles, new-user trigger, avatars), `supabase-captions-v1.sql` (generations, captions,
moments bucket; superseded in part), then `supabase-bracket.sql` (eight-caption bracket, picks,
posting, likes). `scripts/sql.sh "<sql>"` runs SQL against the project
using the Supabase CLI login.

```bash
npm run dev        # http://localhost:3000
npm test           # unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run lint
```
