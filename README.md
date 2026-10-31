# WardWise NG

**Clinical learning, guided clerking and virtual-patient simulation for medical students.**

WardWise NG is an educational platform for medical and surgery students, especially those training in Nigerian medical schools and teaching hospitals. It is not a licensed clinician or substitute for clinical supervision.

## Product areas

- Workspace: learning shortcuts, recent-case empty state, preferences and account access.
- AI Guided Clinical Clerking: biodata, a separate history for each presenting complaint, review of systems, examination, investigations, assessment and plan.
- Clinical Tutor: focused learning guides and reasoning frameworks.
- Virtual Patient Simulation: consistent fictional scenarios and examiner feedback.
- Case Library: private save, reopen, edit, duplicate-as-new, archive/delete and note export.
- Learning Catalogue: browse by discipline → specialty/subspecialty → topic, with integrated search and topic aliases.

## Current delivery status

- Responsive React/TypeScript/Vite application with navigation, Workspace and light/dark theme.
- Supabase email authentication and profile flows implemented in code.
- Thirteen-stage guided clerking with a separate history for each presenting complaint, distinct ROS, examination, investigations, assessment, plan, note preview and print/PDF.
- Private Case Library workflows implemented in code: save, reopen, edit, archive, delete and duplicate-as-new.
- Authenticated Gemini follow-up question facilitator implemented and deployed as a Supabase Edge Function with JWT verification. The private `GEMINI_API_KEY` still needs to be added as a Supabase Function secret before AI requests can succeed. The current WardWise Cloudflare Pages origins are already allowlisted in the function; `APP_ALLOWED_ORIGINS` is only needed for additional origins such as a future custom domain.
- Clinical Tutor includes six source-linked offline guides: jaundice, paediatric UTI, acute abdominal pain, appendicitis, posterior urethral valves and hypospadias. Independent clinician review and further guide coverage remain pending.
- Virtual Patient Simulation includes two fictional scripted scenarios, request-based examination/investigation disclosure, unknown-detail fallback, formative examiner feedback and saved-session history. The rubric is not a validated OSCE score.
- The separate WardWise Supabase project is active in Frankfurt. Four database migrations are applied; all six public tables have RLS enabled and owner-specific policies. The live database passed a rollback-only two-user isolation test across all six tables on 31 October 2026; the same checks are being added to local pgTAP CI. The security advisor reported no security lints. Real account sign-up and browser-level isolation checks remain pending.
- Cloudflare Pages project `wardwise-ng` is linked to this public GitHub repository. The stable feature-branch preview is deployed at `https://feature-app-foundation.wardwise-ng.pages.dev`; production deployment from `main` remains disabled while the feature PR is under review.
- Account/profile deletion, automatic retention controls, issue-report receiver, clinician approval, institutional privacy approval and production end-to-end testing remain outstanding.

## Technology

- React + TypeScript + Vite
- Supabase JS 2.95.0 for browser authentication and the Data API
- Supabase PostgreSQL and RLS migrations
- Vitest + React Testing Library
- Google Gemini Interactions API through an authenticated Supabase Edge Function
- Cloudflare Pages for static hosting

## Local setup

Use Node.js 20.19+ (Node 22 recommended) and npm.

1. Clone the feature branch while it is under review:
   `git clone --branch feature/app-foundation https://github.com/william-idam-inya/wardwise-ng.git`
2. Enter the repository folder and run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the dedicated WardWise project.
5. Run `npm run dev` and open the local URL printed by Vite.

The public project URL is `https://ooutidbssimzvvgkinek.supabase.co`. The publishable key is available under Supabase Project Settings → API Keys and is already configured in Cloudflare Pages preview/production build environments. Never put a Gemini API key, Supabase service-role key or Supabase secret key in a `VITE_` variable. Those values are bundled into the browser.

Read `docs/supabase-setup.md` and `docs/gemini-setup.md` for backend status and remaining configuration.

## Quality checks

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. CI also starts a local Supabase database and runs `supabase test db` for the pgTAP RLS regression suite. Check the latest GitHub Actions run before treating a branch head as verified.

## Database boundary and security

WardWise uses a dedicated project named `wardwise-ng` (ref `ooutidbssimzvvgkinek`, Frankfurt `eu-central-1`). Do not reuse, reset, pause or delete the existing ClinClerk NG project.

Applied migration files:

- `supabase/migrations/20261031095500_create_profiles.sql`
- `supabase/migrations/20261031095503_create_clinical_cases.sql`
- `supabase/migrations/20261031095507_create_simulation_bookmarks_audit.sql`
- `supabase/migrations/20261031095851_revoke_service_role_from_profiles.sql`

Tables: `profiles`, `clinical_cases`, `clerking_sessions`, `simulation_sessions`, `learning_bookmarks`, and `audit_events`. RLS is enabled on all six. Owner-based policies restrict user records. A rollback-only test against the live project confirmed that two synthetic users could see only their own rows, could not change each other's records or transfer ownership, and could not write audit events from the browser. `supabase/tests/rls_isolation.test.sql` preserves this as a pgTAP regression suite. A separate real-account browser test is still required. The browser uses only the publishable key; no service-role key belongs in client code.

## Clinical and privacy rules

1. Use synthetic or properly de-identified cases only. Do not enter patient names, phone numbers, hospital numbers, addresses, identifiable photos/scans or other identifiers without formal authorisation and an approved lawful basis.
2. Separate supplied facts, clinical interpretation and missing information.
3. Never turn an unanswered question into a negative finding. Mark missing, not elicited, not known, not applicable and not performed accurately.
4. Each presenting complaint has its own history using **Complaint, Course, Cause/context, Complications and Care received**, with symptom-specific questions.
5. Review of systems is a distinct section. Examination findings and interpretation stay separate. Never invent findings, test results, patient answers or dates.
6. AI output is educational and must be checked against current references, local protocols and clinical supervisors.
7. Show meaningful event-confirmed processing stages. Never show fabricated percentages or timer-driven progress.

## Current release gates

- Configure the hosted Supabase Auth Site URL/redirect URLs and complete real registration, confirmation, sign-in and password recovery tests. The local config now limits redirects to localhost and this WardWise Pages project only.
- Complete a browser-level account A/account B isolation journey for profiles, cases, sessions, simulations and bookmarks; the database-level RLS regression has passed and is automated in CI.
- Add `GEMINI_API_KEY` to Supabase Edge Function secrets; test the deployed Gemini function and review quotas. Add `APP_ALLOWED_ORIGINS` only if an additional custom origin is introduced.
- Confirm Cloudflare branch preview build and responsive/browser journeys. Keep production deployment from `main` disabled until review and approval.
- Complete security, accessibility, clinical-content, privacy/legal and institutional reviews.
- Implement account deletion, retention controls and a real issue-report receiver before production.

## Contributing

Work on a feature branch, keep modules small, add tests for changes and open a pull request against `main`. Never commit environment files, credentials, tokens, patient data or identifiable records.
