-- StickyNoter: sticky_notes table + row level security.
--
-- IMPORTANT: every read and write in this app is issued from the browser with
-- the Supabase anon key. Row level security is therefore the ONLY authorization
-- boundary. Without the policies at the bottom of this file, sticky_notes is
-- world-readable and world-writable by anyone who opens devtools.
--
-- This file is idempotent: run it as many times as you like.

create extension if not exists pgcrypto;

create table if not exists public.sticky_notes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  title       text        not null default '',
  content     text        not null default '',
  settings    jsonb       not null default '{"backgroundColor":"yellow"}'::jsonb,
  position_x  integer     not null default 0,
  position_y  integer     not null default 0,
  width       integer     not null default 300,
  height      integer     not null default 200,
  z_index     integer     not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Constraints are added separately so this file also repairs a table created
-- from the older, incomplete schema.
alter table public.sticky_notes
  add column if not exists title      text  not null default '',
  add column if not exists content    text  not null default '',
  add column if not exists settings   jsonb not null default '{"backgroundColor":"yellow"}'::jsonb,
  add column if not exists z_index    integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sticky_notes_background_color_valid'
  ) then
    alter table public.sticky_notes
      add constraint sticky_notes_background_color_valid check (
        settings ->> 'backgroundColor' in
          ('yellow','orange','blue','green','pink','purple','red','teal','gray')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sticky_notes_dimensions_valid'
  ) then
    alter table public.sticky_notes
      add constraint sticky_notes_dimensions_valid check (
        width between 200 and 800 and height between 200 and 800
      );
  end if;
end $$;

create index if not exists sticky_notes_user_id_created_at_idx
  on public.sticky_notes (user_id, created_at asc);

alter table public.sticky_notes enable row level security;

-- `create policy` has no IF NOT EXISTS, so drop first to stay re-runnable.
drop policy if exists sticky_notes_select_own on public.sticky_notes;
drop policy if exists sticky_notes_insert_own on public.sticky_notes;
drop policy if exists sticky_notes_update_own on public.sticky_notes;
drop policy if exists sticky_notes_delete_own on public.sticky_notes;

-- `to authenticated` denies the `anon` role outright: signed-out visitors keep
-- their notes in local React state only, never in the database.
--
-- All four policies are mandatory. The app saves with
-- INSERT ... ON CONFLICT DO UPDATE, and PostgREST checks the insert WITH CHECK
-- on the insert branch and the update USING + WITH CHECK on the conflict
-- branch. Omit the update policy and every save to an existing note writes
-- zero rows.
--
-- `(select auth.uid())` rather than bare `auth.uid()` so the function is
-- evaluated once per statement instead of once per row.

create policy sticky_notes_select_own on public.sticky_notes
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy sticky_notes_insert_own on public.sticky_notes
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy sticky_notes_update_own on public.sticky_notes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy sticky_notes_delete_own on public.sticky_notes
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Verify:
--   select relrowsecurity from pg_class where relname = 'sticky_notes';
--     -> expect: t
--   select policyname, cmd from pg_policies where tablename = 'sticky_notes';
--     -> expect: 4 rows
