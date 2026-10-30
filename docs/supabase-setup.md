# Supabase setup for WardWise NG

This guide applies only to WardWise NG. Keep it separate from the existing ClinClerk NG project.

## 1. Create the dedicated project

The connected Supabase account currently exposes one organisation: williamidaminya@gmail.com's Org. It currently contains clinclerk-ng only. Create a separate project named wardwise-ng in that organisation after reviewing the quote shown by Supabase. Do not select or change the existing ClinClerk project.

Choose a region appropriate for the expected users and institutional data-governance requirements. The app should be used with synthetic or properly de-identified study cases only until privacy and institutional approvals are in place.

## 2. Apply the initial schema

The repository contains the first migration:

supabase/migrations/20261030000000_create_profiles.sql

After creating the new project, install the Supabase CLI and verify its version. From the repository root:

```bash
supabase --version
supabase link --project-ref YOUR_WARDWISE_PROJECT_REF
supabase db push
```

Review the migration before applying it. It creates only public.profiles; it does not touch other projects or tables.

The migration:
- stores the profile row under the authenticated user's ID;
- enables row-level security;
- explicitly grants select, insert, update, and delete to authenticated only;
- uses separate owner policies for all four operations;
- revokes browser-role access from anon;
- adds a database-controlled updated_at trigger.

Do not manually apply this migration to clinclerk-ng.

## 3. Data API exposure requirement (effective 30 October 2026)

Supabase no longer automatically grants Data API access to newly-created public tables. The migration therefore contains explicit least-privilege grants for the profile table. A missing grant causes a 42501 permission denied for table response before RLS runs.

Do not fix a permission error by granting everything to anon. Check the actual request role and required operation, then update the migration only if the app's access model requires it.

## 4. Configure Auth URLs and email confirmation

In the WardWise project's Authentication URL configuration:
- Set the local Site URL to http://localhost:5173.
- Add http://localhost:5173/** to redirect URLs.
- Add the exact Cloudflare preview and production URLs when those environments are created. Avoid broad wildcards for production.
- Keep email confirmation enabled for real user registration unless there is a deliberate, documented reason to change it.
- Test the confirmation and password-recovery emails end-to-end.

The UI supports email/password registration, sign-in, password-reset email and password recovery. The user profile is completed after the first successful sign-in.

## 5. Add the public browser configuration

Copy .env.example to .env.local and set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_WARDWISE_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

A legacy public anon key can be used only if the project does not have a publishable key. Never put a service-role key, secret key, database password or Gemini key in .env.local or any VITE_ variable.

## 6. Verify profile privacy

After the migration has been applied:
1. Create test account A and complete its profile.
2. Create test account B and complete its profile.
3. As A, verify A can select and update A's profile.
4. As A, attempt a direct query for B's profile ID; it must return no row.
5. As A, attempt to insert or update a profile row using B's ID; it must be rejected.
6. Repeat the reverse checks as B.
7. With no session, confirm the profile table cannot be read or changed.
8. Check Supabase security advisors and database policy results.

Do not mark user-data isolation as verified until these tests pass against the actual WardWise project.

## 7. Known current boundary

No WardWise Supabase project has been created or migrated yet. The existing clinclerk-ng project is intentionally untouched. Once a separate project exists, configure its URL/key locally, apply the migration, then verify email registration, sign-in, profile save/edit and two-user RLS isolation before enabling private case storage.