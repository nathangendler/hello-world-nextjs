-- Pivot: a moment is a photo plus eight AI captions. The owner picks through a
-- single-elimination bracket (7 picks); the survivor becomes the posted caption.
-- Posted moments are public and can be liked. Everything else is owner-only.

-- Old flow data (3 captions per moment, 1-10 ratings) does not fit the bracket.
delete from public.generations;
drop view if exists public.feed_captions;
drop view if exists public.caption_scores;
drop table if exists public.ratings;

alter table public.generations drop column if exists vibe;
alter table public.generations drop constraint if exists generations_need_input;
alter table public.generations alter column image_url set not null;
alter table public.generations add column if not exists winner_caption_id uuid references public.captions (id) on delete set null;
alter table public.generations add column if not exists posted_at timestamptz;
alter table public.generations add constraint generations_posted_consistent
  check ((winner_caption_id is null) = (posted_at is null));
create index if not exists generations_posted_at_idx on public.generations (posted_at desc) where posted_at is not null;

alter table public.captions drop constraint if exists captions_position_check;
alter table public.captions add constraint captions_position_check check (position between 1 and 8);

create table if not exists public.picks (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  pick_index smallint not null check (pick_index between 0 and 6),
  winner_caption_id uuid not null references public.captions (id) on delete cascade,
  loser_caption_id uuid not null references public.captions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (generation_id, pick_index),
  check (winner_caption_id <> loser_caption_id)
);

create table if not exists public.likes (
  generation_id uuid not null references public.generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (generation_id, user_id)
);

alter table public.picks enable row level security;
alter table public.likes enable row level security;

-- Privileges: the minimum each role needs.
revoke all on public.generations, public.captions, public.picks, public.likes from anon, authenticated;
grant select on public.generations, public.captions to anon, authenticated;
grant insert on public.generations, public.captions to authenticated;
grant update (winner_caption_id, posted_at) on public.generations to authenticated;
grant select, insert on public.picks to authenticated;
grant select, insert, delete on public.likes to authenticated;

create or replace function public.is_posted(target_generation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.generations g where g.id = target_generation and g.posted_at is not null
  );
$$;
revoke all on function public.is_posted(uuid) from public;
grant execute on function public.is_posted(uuid) to anon, authenticated;

-- generations: the public sees posted moments; owners see their own drafts too.
drop policy if exists "Anyone can read generations" on public.generations;
create policy "Posted moments are public, drafts are private" on public.generations
  for select to anon, authenticated
  using (posted_at is not null or user_id = (select auth.uid()));

-- Checking a caption's parent inside a generations policy would re-enter the
-- generations policy; a definer function reads the link without RLS.
create or replace function public.caption_in_moment(target_caption uuid, target_generation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.captions c where c.id = target_caption and c.generation_id = target_generation
  );
$$;
revoke all on function public.caption_in_moment(uuid, uuid) from public;
grant execute on function public.caption_in_moment(uuid, uuid) to authenticated;

drop policy if exists "Owners post their moment" on public.generations;
create policy "Owners post their moment" on public.generations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (winner_caption_id is null or public.caption_in_moment(winner_caption_id, id))
  );


-- captions: visible when their moment is.
drop policy if exists "Anyone can read captions" on public.captions;
create policy "Captions follow their moment" on public.captions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.generations g
      where g.id = generation_id
        and (g.posted_at is not null or g.user_id = (select auth.uid()))
    )
  );

-- picks: only the moment's owner, only before it is posted.
drop policy if exists "Owners read own picks" on public.picks;
create policy "Owners read own picks" on public.picks
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Owners pick on their unposted moment" on public.picks;
create policy "Owners pick on their unposted moment" on public.picks
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.generations g
      where g.id = generation_id and g.user_id = (select auth.uid()) and g.posted_at is null
    )
    and public.caption_in_moment(winner_caption_id, generation_id)
    and public.caption_in_moment(loser_caption_id, generation_id)
  );

-- likes: anyone signed in can like a posted moment once, and unlike it.
drop policy if exists "Users read own likes" on public.likes;
create policy "Users read own likes" on public.likes
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users like posted moments" on public.likes;
create policy "Users like posted moments" on public.likes
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_posted(generation_id));

drop policy if exists "Users remove own likes" on public.likes;
create policy "Users remove own likes" on public.likes
  for delete to authenticated using (user_id = (select auth.uid()));

-- Like totals are the only public window into likes.
create or replace view public.like_counts with (security_invoker = false) as
select generation_id, count(*)::int as like_count
from public.likes
group by generation_id;
revoke all on public.like_counts from public, anon, authenticated;
grant select on public.like_counts to anon, authenticated;

-- One row per posted moment with its winning caption and like total.
create or replace view public.posts with (security_invoker = true) as
select
  g.id,
  g.user_id,
  g.user_note,
  g.image_url,
  g.posted_at,
  c.text as caption,
  coalesce(lc.like_count, 0) as like_count
from public.generations g
join public.captions c on c.id = g.winner_caption_id
left join public.like_counts lc on lc.generation_id = g.id
where g.posted_at is not null;
revoke all on public.posts from public, anon, authenticated;
grant select on public.posts to anon, authenticated;
