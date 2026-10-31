# Supabase setup for WardWise NG

This guide applies only to WardWise NG. The separate ClinClerk NG project is unchanged and must never be reused, reset or deleted for this app.

## 1. Dedicated project — created

The separate project is active and healthy:

- Project: `wardwise-ng`
- Project ref: `ooutidbssimzvvgkinek`
- Region: Frankfurt (`eu-central-1`)
- Project URL: `https://ooutidbssimzvvgkinek.supabase.co`
- Organisation: the existing personal organisation on the Free plan.

The project was quoted at $0/month when created on 31 October 2026. Check the current Supabase billing page before enabling paid add-ons or changing plans. The project is distinct from `clinclerk-ng`.

Use synthetic or properly de-identified study cases only until privacy and institutional approvals are in place.

## 2. Database migrations — applied

The following migrations have been applied to the WardWise project:

1. `20261030000000_create_profiles.sql`
2. `20261030010000_create_clinical_cases.sql`
3. `20261031010000_create_simulation_bookmarks_audit.sql`
4. `20261031101500_revoke_service_role_from_profiles.sql`

The six public tables now present are:

- `profiles`
- `clinical_cases`
- `clerking_sessions`
- `simulation_sessions`
- `learning_bookmarks`
- `audit_events`

RLS is enabled on all six tables. Owner-specific policies exist for user-managed records. Audit events are readable by their owner and do not have a browser insert/update/delete policy. The profile table's `service_role` table grant was explicitly revoked; the browser uses the authenticated role and owner-specific RLS.

The database security advisor reported no security lints after setup. Its performance advisor reported unused indexes on the new, empty tables; that is expected before real query activity and is not evidence of an access-control failure.

## 3. Data API exposure and grants

New public tables may require explicit Data API grants depending on the project's Data API settings. The migrations grant only the operations the browser features need and pair those grants with RLS. A missing grant can cause a permission-denied response before RLS runs.

Do not fix a permission error by granting everything to `anon`. Check the actual request role and operation, and preserve owner-based policies. Never expose a service-role or secret key in the browser.

## 4. Configure Auth URLs and email confirmation — still required

Open the [WardWise Auth URL configuration](https://supabase.com/dashboard/project/ooutidbssimzvvgkinek/auth/url-configuration).

Set:

- Site URL: `https://wardwise-ng.pages.dev`
- Production redirect: `https://wardwise-ng.pages.dev/**`
- Cloudflare preview redirect pattern: `https://*.wardwise-ng.pages.dev/**`
- Local development redirect: `http://localhost:5173/**`

The wildcard is limited to this WardWise Pages project so unique preview deployment URLs can complete auth callbacks. Do not use a broad wildcard such as all `pages.dev` hosts for production. Keep email confirmation enabled for real user registration unless there is a deliberate, documented reason to change it.

The UI supports email/password registration, sign-in, password-reset email and password recovery. Complete end-to-end email tests before production use.

## 5. Browser configuration

Cloudflare Pages has been connected to the public GitHub repository `william-idam-inya/wardwise-ng`. These public browser values are configured for preview and production builds:

- `VITE_SUPABASE_URL`: `https://ooutidbssimzvvgkinek.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: configured in Cloudflare Pages as a public publishable key.

For local development, copy `.env.example` to `.env.local` and use the same two values. A publishable key is designed to be exposed in browser code when RLS is correctly enabled. Never put a service-role key, Supabase secret key, database password or Gemini API key in `.env.local` or a `VITE_` variable.

## 6. Verify profile privacy with two accounts — not yet completed

The database policies have been inspected, but account-to-account behaviour has not yet been verified. After Auth URLs are configured:

1. Create test account A and complete its profile.
2. Create test account B and complete its profile.
3. As A, verify A can select and update A's profile.
4. As A, query B's profile ID directly; it must return no row.
5. As A, attempt to insert or update a profile row using B's ID; it must be rejected.
6. Repeat the reverse checks as B.
7. With no session, confirm the profile table cannot be read or changed.
8. Check Supabase security advisors and database policy results.

Extend the tests to cover cases, clerking sessions, simulation sessions and bookmarks. Account A must not read, update or delete account B's records. Do not mark user-data isolation as verified until these tests pass.

## 7. Clinical cases and clerking sessions

The case migration creates:

- `clinical_cases`: owner, non-identifying label, specialty, setting, draft/archive status, synthetic/de-identified category, structured JSON and formatted note.
- `clerking_sessions`: owner-bound current stage and answers, linked to `clinical_cases` by a composite foreign key on `(case_id, user_id)`.

The composite foreign key prevents a session from being attached to another user's case. Deleting a case cascades to its session. The app saves the case row and session row as two API writes; if the second write fails after the case row succeeds, the UI reports partial save and retains the case ID so the learner can retry.

Test with two authenticated accounts: create/reopen/edit as A; attempt read/update/delete as B; archive and delete a case; confirm its session is removed; and confirm anonymous users cannot access rows. A successful save is not clinical validation or supervisor sign-off.

## 8. Simulation sessions, bookmarks and audit events

The third migration adds:

- `simulation_sessions`: owner-bound scenario ID, bounded transcript JSON, assessment JSON, optional score and timestamps. Leave score null until the rubric is independently reviewed.
- `learning_bookmarks`: owner-bound stable topic/guide identifiers.
- `audit_events`: minimal metadata-only events; never store histories, transcripts, notes, patient identifiers or secrets.

The browser can read only its own audit events and cannot insert/update/delete them. Any future audit writer must be server-side and must store metadata only.

## 9. Gemini function status

The authenticated `clinical-assistant` Supabase Edge Function is deployed (version 2) with JWT verification enabled. Its URL is:

`https://ooutidbssimzvvgkinek.supabase.co/functions/v1/clinical-assistant`

The function still needs the private `GEMINI_API_KEY` and `APP_ALLOWED_ORIGINS` secrets before it can answer AI requests. See `docs/gemini-setup.md`. Do not send API keys through chat or commit them to Git.

## 10. Privacy and clinical-safety boundaries

The in-app notice explains the current database setup and remaining release gates. It also states:

- Do not enter patient names, hospital identifiers, contact details, exact dates of birth, identifiable images or other patient identifiers.
- `store: false` is not a guarantee of zero provider-side processing or retention; review Google's applicable terms before enabling AI processing.
- Account/profile deletion, automatic retention controls and a dedicated in-app content-report receiver are not implemented.
- WardWise is not approved for identifiable patient information. The notice is not a final legal privacy policy or a claim of compliance with the Nigeria Data Protection Act.

Obtain appropriate Nigerian privacy/legal review and institutional approval before any patient-related data processing.
