-- Run once against the Supabase project to create and seed the albums table.
create table if not exists public.albums (
  id bigint generated always as identity primary key,
  title text not null,
  artist text not null,
  year int not null,
  rating int not null check (rating between 1 and 10),
  created_at timestamptz not null default now()
);

alter table public.albums enable row level security;

drop policy if exists "Public read access" on public.albums;
create policy "Public read access" on public.albums
  for select to anon using (true);

insert into public.albums (title, artist, year, rating) values
  ('To Pimp a Butterfly', 'Kendrick Lamar', 2015, 10),
  ('Blonde', 'Frank Ocean', 2016, 9),
  ('In Rainbows', 'Radiohead', 2007, 9),
  ('Rumours', 'Fleetwood Mac', 1977, 8),
  ('Discovery', 'Daft Punk', 2001, 8),
  ('Currents', 'Tame Impala', 2015, 7);
