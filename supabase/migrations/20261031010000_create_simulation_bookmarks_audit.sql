-- WardWise NG — simulation sessions, learning bookmarks and minimal audit events.
-- Apply only to the NEW WardWise NG Supabase project after the profile and case migrations.
-- Do not apply to the existing ClinClerk NG project.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema public to authenticated;

create table if not exists public.simulation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  scenario_id text not null check (char_length(btrim(scenario_id)) between 2 and 120),
  transcript jsonb not null default '[]'::jsonb
    check (jsonb_typeof(transcript) = 'array' and pg_column_size(transcript) <= 65536),
  assessment jsonb not null default '{}'::jsonb
    check (jsonb_typeof(assessment) = 'object' and pg_column_size(assessment) <= 16384),
  score smallint null check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.simulation_sessions is
  'Owner-restricted fictional virtual-patient practice sessions. Transcripts are learner-entered text; do not put real patient information here.';
comment on column public.simulation_sessions.score is
  'Optional formative score only. Leave null until a scenario-specific rubric and its interpretation have been independently reviewed.';

create table if not exists public.learning_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id text not null check (char_length(btrim(topic_id)) between 2 and 180),
  created_at timestamptz not null default now(),
  constraint learning_bookmarks_user_topic_unique unique (user_id, topic_id)
);

comment on table public.learning_bookmarks is
  'Learner-owned bookmarks to stable topic or guide identifiers; no patient or case narrative should be stored here.';

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in (
    'case.created',
    'case.updated',
    'case.archived',
    'case.deleted',
    'simulation.saved',
    'simulation.deleted',
    'bookmark.added',
    'bookmark.removed'
  )),
  resource_type text not null check (resource_type in ('clinical_case', 'simulation_session', 'learning_bookmark')),
  resource_id uuid null,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 2048),
  created_at timestamptz not null default now()
);

comment on table public.audit_events is
  'Minimal metadata-only audit events. Never store patient identifiers, free-text histories, transcripts, notes or secrets. Writers are server-side only.';

-- Owner-only row access. Simulation sessions can be created, resumed and deleted by their owner.
alter table public.simulation_sessions enable row level security;
create policy "simulation_sessions_select_own"
  on public.simulation_sessions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "simulation_sessions_insert_own"
  on public.simulation_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "simulation_sessions_update_own"
  on public.simulation_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "simulation_sessions_delete_own"
  on public.simulation_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Bookmarks are addable/readable/removable by their owner; stable topic IDs are unique per user.
alter table public.learning_bookmarks enable row level security;
create policy "learning_bookmarks_select_own"
  on public.learning_bookmarks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "learning_bookmarks_insert_own"
  on public.learning_bookmarks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "learning_bookmarks_delete_own"
  on public.learning_bookmarks for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Audit events are readable by their owner. No browser insert/update/delete policy is provided;
-- a future authenticated server-side writer should create these records with minimal metadata.
alter table public.audit_events enable row level security;
create policy "audit_events_select_own"
  on public.audit_events for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.simulation_sessions from anon, authenticated, service_role;
revoke all on table public.learning_bookmarks from anon, authenticated, service_role;
revoke all on table public.audit_events from anon, authenticated, service_role;

grant select, insert, update, delete on table public.simulation_sessions to authenticated;
grant select, insert, delete on table public.learning_bookmarks to authenticated;
grant select on table public.audit_events to authenticated;
grant insert on table public.audit_events to service_role;

create index if not exists simulation_sessions_user_created_idx
  on public.simulation_sessions (user_id, created_at desc);
create index if not exists learning_bookmarks_user_created_idx
  on public.learning_bookmarks (user_id, created_at desc);
create index if not exists audit_events_user_created_idx
  on public.audit_events (user_id, created_at desc);
create index if not exists audit_events_resource_idx
  on public.audit_events (resource_type, resource_id)
  where resource_id is not null;

create or replace function private.set_simulation_sessions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.set_simulation_sessions_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists simulation_sessions_set_updated_at on public.simulation_sessions;
create trigger simulation_sessions_set_updated_at
before update on public.simulation_sessions
for each row execute function private.set_simulation_sessions_updated_at();
