-- AI caption generations, the captions they produce, and 1-10 ratings on captions.
-- RLS is on for every table. Reads are public (the feed is shareable); writes are
-- limited to the signed-in owner. Rating rows are private; only aggregates are public.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vibe text not null check (vibe in ('hype', 'roast', 'poetic', 'midwest')),
  user_note text check (char_length(user_note) <= 300),
  image_url text,
  prompt text not null,
  model text not null,
  created_at timestamptz not null default now(),
  constraint generations_need_input check (user_note is not null or image_url is not null)
);
create index if not exists generations_user_id_idx on public.generations (user_id, created_at desc);

create table if not exists public.captions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations (id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now(),
  unique (generation_id, position)
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  caption_id uuid not null references public.captions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score smallint not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  unique (caption_id, user_id)
);
create index if not exists ratings_caption_id_idx on public.ratings (caption_id);

alter table public.generations enable row level security;
alter table public.captions enable row level security;
alter table public.ratings enable row level security;

grant select, insert on public.generations to authenticated;
grant select on public.generations to anon;
grant select, insert on public.captions to authenticated;
grant select on public.captions to anon;
grant select, insert, update on public.ratings to authenticated;

drop policy if exists "Anyone can read generations" on public.generations;
create policy "Anyone can read generations" on public.generations
  for select to anon, authenticated using (true);

drop policy if exists "Users create own generations" on public.generations;
create policy "Users create own generations" on public.generations
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Anyone can read captions" on public.captions;
create policy "Anyone can read captions" on public.captions
  for select to anon, authenticated using (true);

drop policy if exists "Users add captions to own generations" on public.captions;
create policy "Users add captions to own generations" on public.captions
  for insert to authenticated with check (
    exists (
      select 1 from public.generations g
      where g.id = generation_id and g.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users read own ratings" on public.ratings;
create policy "Users read own ratings" on public.ratings
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users create own ratings" on public.ratings;
create policy "Users create own ratings" on public.ratings
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users change own ratings" on public.ratings;
create policy "Users change own ratings" on public.ratings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Aggregates are the only public window into ratings. This view intentionally runs
-- with the owner's privileges so readers never see individual rating rows.
-- weighted_score pulls captions with few ratings toward 5 so one 10/10 can't top the feed.
create or replace view public.caption_scores with (security_invoker = false) as
select
  caption_id,
  count(*)::int as rating_count,
  round(avg(score)::numeric, 1)::float8 as average_score,
  round(((sum(score) + 5.0 * 3) / (count(*) + 3))::numeric, 2)::float8 as weighted_score
from public.ratings
group by caption_id;
revoke all on public.caption_scores from public;
grant select on public.caption_scores to anon, authenticated;

-- One row per caption with its generation context and scores, for feed pages.
create or replace view public.feed_captions with (security_invoker = true) as
select
  c.id,
  c.text,
  c.position,
  c.generation_id,
  c.created_at,
  g.user_id,
  g.vibe,
  g.user_note,
  g.image_url,
  coalesce(s.rating_count, 0) as rating_count,
  s.average_score,
  coalesce(s.weighted_score, 5.0) as weighted_score
from public.captions c
join public.generations g on g.id = c.generation_id
left join public.caption_scores s on s.caption_id = c.id;
grant select on public.feed_captions to anon, authenticated;

-- Photos that captions are generated for. Public bucket; users write only their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moments', 'moments', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own moments" on storage.objects;
create policy "Users upload own moments" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'moments' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Supabase grants anon/authenticated full table privileges by default. Strip
-- everything the app does not use so RLS is the second line of defence, not the first.
revoke all on public.albums from anon, authenticated;
grant select on public.albums to anon, authenticated;
revoke all on public.profiles from anon;
revoke insert, delete on public.profiles from authenticated;
revoke all on public.generations from anon;
grant select on public.generations to anon;
revoke update, delete on public.generations from authenticated;
revoke all on public.captions from anon;
grant select on public.captions to anon;
revoke update, delete on public.captions from authenticated;
revoke all on public.ratings from anon;
revoke delete on public.ratings from authenticated;
revoke all on public.caption_scores, public.feed_captions from anon, authenticated;
grant select on public.caption_scores, public.feed_captions to anon, authenticated;
