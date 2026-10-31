-- WardWise NG — owner isolation regression tests.
-- Run locally with: supabase db start && supabase test db
-- Every fixture is synthetic and rolled back by the test transaction.

create extension if not exists pgtap with schema extensions;

begin;

select plan(30);

-- Temporary Auth users are fixtures only. No password or real identity is used.
insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'wardwise-rls-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000102', 'authenticated', 'authenticated', 'wardwise-rls-b@example.invalid');

insert into public.profiles (id, full_name, study_level, institution)
values
  ('00000000-0000-4000-8000-000000000101', 'WardWise RLS Test A', '400 Level', 'Temporary Test University'),
  ('00000000-0000-4000-8000-000000000102', 'WardWise RLS Test B', '500 Level', 'Temporary Test University');

insert into public.clinical_cases (id, user_id, title, specialty, setting, case_category)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Synthetic RLS Test Case A', 'Medicine', 'Teaching ward', 'synthetic'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'Synthetic RLS Test Case B', 'Surgery', 'Teaching ward', 'synthetic');

insert into public.clerking_sessions (id, case_id, user_id, current_stage, answers)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 1, '{"test": "A"}'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 1, '{"test": "B"}');

insert into public.simulation_sessions (id, user_id, scenario_id)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101', 'fictional-rls-a'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000102', 'fictional-rls-b');

insert into public.learning_bookmarks (id, user_id, topic_id)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000101', 'rls-test-topic-a'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000102', 'rls-test-topic-b');

insert into public.audit_events (id, user_id, event_type, resource_type, metadata)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000101', 'case.created', 'clinical_case', '{"test": true}'),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000102', 'case.created', 'clinical_case', '{"test": true}');

-- Anonymous browser access must not have table-level SELECT grants.
select is(has_table_privilege('anon', 'public.profiles', 'SELECT'), false, 'anon cannot select profiles');
select is(has_table_privilege('anon', 'public.clinical_cases', 'SELECT'), false, 'anon cannot select clinical cases');
select is(has_table_privilege('anon', 'public.clerking_sessions', 'SELECT'), false, 'anon cannot select clerking sessions');
select is(has_table_privilege('anon', 'public.simulation_sessions', 'SELECT'), false, 'anon cannot select simulation sessions');
select is(has_table_privilege('anon', 'public.learning_bookmarks', 'SELECT'), false, 'anon cannot select learning bookmarks');
select is(has_table_privilege('anon', 'public.audit_events', 'SELECT'), false, 'anon cannot select audit events');

-- User A can see only A-owned rows.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000101';

select is((select count(*)::integer from public.profiles), 1, 'A sees only A profile');
select is((select count(*)::integer from public.clinical_cases), 1, 'A sees only A cases');
select is((select count(*)::integer from public.clerking_sessions), 1, 'A sees only A clerking sessions');
select is((select count(*)::integer from public.simulation_sessions), 1, 'A sees only A simulations');
select is((select count(*)::integer from public.learning_bookmarks), 1, 'A sees only A bookmarks');
select is((select count(*)::integer from public.audit_events), 1, 'A sees only A audit events');

select is((
  with changed as (
    update public.clinical_cases set title = 'Cross-user mutation'
    where id = '00000000-0000-4000-8000-000000000202'
    returning id
  )
  select count(*)::integer from changed
), 0, 'A cannot update B case');

select is((
  with removed as (
    delete from public.profiles
    where id = '00000000-0000-4000-8000-000000000102'
    returning id
  )
  select count(*)::integer from removed
), 0, 'A cannot delete B profile');

select throws_ok(
  $$insert into public.clinical_cases (user_id, title, specialty, setting)
    values ('00000000-0000-4000-8000-000000000102', 'Forbidden case', 'Medicine', 'Ward')$$,
  '42501',
  'new row violates row-level security policy for table "clinical_cases"',
  'A cannot insert a B-owned case'
);

select throws_ok(
  $$update public.clinical_cases
    set user_id = '00000000-0000-4000-8000-000000000102'
    where id = '00000000-0000-4000-8000-000000000201'$$,
  '42501',
  'new row violates row-level security policy for table "clinical_cases"',
  'A cannot transfer ownership of A case'
);

select throws_ok(
  $$insert into public.simulation_sessions (user_id, scenario_id)
    values ('00000000-0000-4000-8000-000000000102', 'forbidden-scenario')$$,
  '42501',
  'new row violates row-level security policy for table "simulation_sessions"',
  'A cannot insert a B-owned simulation'
);

select throws_ok(
  $$insert into public.learning_bookmarks (user_id, topic_id)
    values ('00000000-0000-4000-8000-000000000102', 'forbidden-topic')$$,
  '42501',
  'new row violates row-level security policy for table "learning_bookmarks"',
  'A cannot insert a B-owned bookmark'
);

select throws_ok(
  $$insert into public.profiles (id, full_name, study_level, institution)
    values ('00000000-0000-4000-8000-000000000102', 'Forbidden Profile', '400 Level', 'Temporary Test University')$$,
  '42501',
  'new row violates row-level security policy for table "profiles"',
  'A cannot create B profile'
);

select throws_ok(
  $$insert into public.audit_events (user_id, event_type, resource_type)
    values ('00000000-0000-4000-8000-000000000101', 'case.created', 'clinical_case')$$,
  '42501',
  'permission denied for table audit_events',
  'A cannot write audit events from the browser'
);

-- User B sees only B-owned rows and cannot change A's rows or transfer ownership.
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000102';

select is((select count(*)::integer from public.profiles), 1, 'B sees only B profile');
select is((select count(*)::integer from public.clinical_cases), 1, 'B sees only B cases');
select is((select count(*)::integer from public.clerking_sessions), 1, 'B sees only B clerking sessions');
select is((select count(*)::integer from public.simulation_sessions), 1, 'B sees only B simulations');
select is((select count(*)::integer from public.learning_bookmarks), 1, 'B sees only B bookmarks');
select is((select count(*)::integer from public.audit_events), 1, 'B sees only B audit events');

select is((
  with changed as (
    update public.clinical_cases set title = 'Cross-user mutation'
    where id = '00000000-0000-4000-8000-000000000201'
    returning id
  )
  select count(*)::integer from changed
), 0, 'B cannot update A case');

select is((
  with removed as (
    delete from public.profiles
    where id = '00000000-0000-4000-8000-000000000101'
    returning id
  )
  select count(*)::integer from removed
), 0, 'B cannot delete A profile');

select throws_ok(
  $$insert into public.clinical_cases (user_id, title, specialty, setting)
    values ('00000000-0000-4000-8000-000000000101', 'Forbidden case', 'Medicine', 'Ward')$$,
  '42501',
  'new row violates row-level security policy for table "clinical_cases"',
  'B cannot insert an A-owned case'
);

select throws_ok(
  $$update public.clinical_cases
    set user_id = '00000000-0000-4000-8000-000000000101'
    where id = '00000000-0000-4000-8000-000000000202'$$,
  '42501',
  'new row violates row-level security policy for table "clinical_cases"',
  'B cannot transfer ownership of B case'
);

select * from finish();

-- The Supabase CLI also wraps each test in a transaction; this explicit rollback
-- makes the fixture lifecycle obvious when the test is executed manually.
rollback;
