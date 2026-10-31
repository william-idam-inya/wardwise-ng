-- WardWise NG — Milestone 1: private student profiles.
-- This migration is for a NEW WardWise NG Supabase project only.
-- Do not apply it to the existing ClinClerk NG database.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  sex text null check (sex is null or sex in ('female', 'male', 'intersex', 'prefer_not_to_say')),
  age_years smallint null check (age_years is null or age_years between 10 and 120),
  study_level text not null check (
    study_level in (
      '100 Level', '200 Level', '300 Level', '400 Level',
      '500 Level', '600 Level', '700 Level', 'Graduate', 'Other'
    )
  ),
  institution text not null check (char_length(btrim(institution)) between 2 and 180),
  training_site text null check (training_site is null or char_length(training_site) <= 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'WardWise NG learner profile. One row per authenticated user; personal data is owner-restricted.';
comment on column public.profiles.age_years is
  'Optional age in whole years. Date of birth is deliberately not collected in this milestone.';

-- Keep internal trigger functions outside the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

-- Supabase's 30 October 2026 Data API change requires explicit table grants.
grant usage on schema public to authenticated;
-- The authenticated role is the only browser role permitted to access profiles.
revoke all on table public.profiles from anon, authenticated, service_role;
grant select, insert, update, delete on table public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create index if not exists profiles_study_level_idx on public.profiles (study_level);

-- Keep updated_at controlled by Postgres rather than trusting browser input.
create or replace function private.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.set_profiles_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_profiles_updated_at();
