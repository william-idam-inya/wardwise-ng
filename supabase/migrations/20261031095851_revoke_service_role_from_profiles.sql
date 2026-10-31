-- Keep private learner profiles accessible only through the authenticated owner RLS path.
revoke all on table public.profiles from anon, service_role;
grant select, insert, update, delete on table public.profiles to authenticated;
