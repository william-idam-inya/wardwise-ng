-- WardWise NG — private clinical learning cases and clerking sessions.
-- Apply only to the separate WardWise NG Supabase project.
-- All rows are owned by one authenticated account. Do not store identifiable patient data.

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 180),
  specialty text not null check (char_length(btrim(specialty)) between 2 and 100),
  setting text not null check (char_length(btrim(setting)) between 2 and 100),
  status text not null default 'draft' check (status in ('draft', 'completed', 'archived')),
  case_category text not null default 'synthetic' check (case_category in ('synthetic', 'deidentified')),
  structured_data jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_data) = 'object'),
  structured_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinical_cases_id_user_id_unique unique (id, user_id)
);

comment on table public.clinical_cases is
  'Private learner-owned fictional or properly de-identified clinical education cases. Do not store patient identifiers.';
comment on column public.clinical_cases.structured_data is
  'The learner-entered structured clerking draft. Treat as sensitive user content and never log the payload.';
comment on column public.clinical_cases.structured_note is
  'Generated note preview from the supplied structured data; not a verified clinical record.';

create table if not exists public.clerking_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  current_stage smallint not null default 0 check (current_stage between 0 and 12),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clerking_sessions_case_user_unique unique (case_id, user_id),
  constraint clerking_sessions_case_owner_fk
    foreign key (case_id, user_id)
    references public.clinical_cases (id, user_id)
    on delete cascade
);

comment on table public.clerking_sessions is
  'Private owner-bound progress and answers for a WardWise NG clinical clerking session.';

-- Explicit Data API privileges for the authenticated browser role.
grant usage on schema public to authenticated;
revoke all on table public.clinical_cases from anon, authenticated, service_role;
revoke all on table public.clerking_sessions from anon, authenticated, service_role;
grant select, insert, update, delete on table public.clinical_cases to authenticated;
grant select, insert, update, delete on table public.clerking_sessions to authenticated;

alter table public.clinical_cases enable row level security;
alter table public.clerking_sessions enable row level security;

create policy "clinical_cases_select_own"
  on public.clinical_cases for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "clinical_cases_insert_own"
  on public.clinical_cases for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "clinical_cases_update_own"
  on public.clinical_cases for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "clinical_cases_delete_own"
  on public.clinical_cases for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "clerking_sessions_select_own"
  on public.clerking_sessions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "clerking_sessions_insert_own"
  on public.clerking_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "clerking_sessions_update_own"
  on public.clerking_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "clerking_sessions_delete_own"
  on public.clerking_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists clinical_cases_user_updated_idx
  on public.clinical_cases (user_id, updated_at desc);
create index if not exists clinical_cases_user_status_idx
  on public.clinical_cases (user_id, status, updated_at desc);
create index if not exists clerking_sessions_user_idx
  on public.clerking_sessions (user_id, updated_at desc);

create or replace function private.set_clinical_cases_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.set_clinical_cases_updated_at() from public, anon, authenticated, service_role;

create or replace function private.set_clerking_sessions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.set_clerking_sessions_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists clinical_cases_set_updated_at on public.clinical_cases;
create trigger clinical_cases_set_updated_at
before update on public.clinical_cases
for each row execute function private.set_clinical_cases_updated_at();

drop trigger if exists clerking_sessions_set_updated_at on public.clerking_sessions;
create trigger clerking_sessions_set_updated_at
before update on public.clerking_sessions
for each row execute function private.set_clerking_sessions_updated_at();
