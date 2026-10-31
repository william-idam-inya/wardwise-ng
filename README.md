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
- Authenticated Gemini follow-up question facilitator implemented and deployed as a Supabase Edge Function with JWT verification. The Gemini API key and exact app origins still need to be added as server-side secrets before AI requests work.
- Clinical Tutor includes six source-linked offline guides: jaundice, paediatric UTI, acute abdominal pain, appendicitis, posterior urethral valves and hypospadias. Independent clinician review and further guide coverage remain pending.
- Virtual Patient Simulation includes two fictional scripted scenarios, request-based examination/investigation disclosure, unknown-detail fallback, formative examiner feedback and saved-session history. The rubric is not a validated OSCE score.
- The separate WardWise Supabase project has been created in Frankfurt. Four database migrations are applied; six public tables exist with RLS enabled and owner-specific policies. Database security advisor currently reports no security lints. Two-account behavioural isolation and live browser journeys are not yet verified.
- Cloudflare Pages project `wardwise-ng` is linked to this public GitHub repository. Preview deployments are configured for branches; production deployments from `main` are disabled while the feature PR remains under review. The first preview build is pending.
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

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. CI runs these on pushes and pull requests. The full suite passed on commit `0a36a57` on 31 October 2026. Subsequent documentation, privacy-notice and migration updates trigger a new CI run; inspect that run before treating the current head as green.

## Database boundary and security

WardWise uses a dedicated project named `wardwise-ng` (ref `ooutidbssimzvvgkinek`, Frankfurt `eu-central-1`). Do not reuse, reset, pause or delete the existing ClinClerk NG project.

Applied migration files:

- `supabase/migrations/20261030000000_create_profiles.sql`
- `supabase/migrations/20261030010000_create_clinical_cases.sql`
- `supabase/migrations/20261031010000_create_simulation_bookmarks_audit.sql`
- `supabase/migrations/20261031101500_revoke_service_role_from_profiles.sql`

Tables: `profiles`, `clinical_cases`, `clerking_sessions`, `simulation_sessions`, `learning_bookmarks`, and `audit_events`. RLS is enabled on all six. Owner-based policies restrict user records. The browser uses only the publishable key; no service-role key belongs in the client. Two-user isolation testing remains required before real-user case data is enabled.

## Clinical and privacy rules

1. Use synthetic or properly de-identified cases only. Do not enter patient names, phone numbers, hospital numbers, addresses, identifiable photos/scans or other identifiers without formal authorisation and an approved lawful basis.
2. Separate supplied facts, clinical interpretation and missing information.
3. Never turn an unanswered question into a negative finding. Mark missing, not elicited, not known, not applicable and not performed accurately.
4. Each presenting complaint has its own history using **Complaint, Course, Cause/context, Complications and Care received**, with symptom-specific questions.
5. Review of systems is a distinct section. Examination findings and interpretation stay separate. Never invent findings, test results, patient answers or dates.
6. AI output is educational and must be checked against current references, local protocols and clinical supervisors.
7. Show meaningful event-confirmed processing stages. Never show fabricated percentages or timer-driven progress.

## Current release gates

- Configure Supabase Auth Site URL/redirect URLs and complete real registration, confirmation, sign-in and password recovery tests.
- Complete two-user RLS isolation checks for profiles, cases, sessions, simulations and bookmarks.
- Add `GEMINI_API_KEY` and `APP_ALLOWED_ORIGINS` to Supabase Edge Function secrets; test the deployed Gemini function and review quotas.
- Confirm Cloudflare branch preview build and responsive/browser journeys. Keep production deployment from `main` disabled until review and approval.
- Complete security, accessibility, clinical-content, privacy/legal and institutional reviews.
- Implement account deletion, retention controls and a real issue-report receiver before production.

## Contributing

Work on a feature branch, keep modules small, add tests for changes and open a pull request against `main`. Never commit environment files, credentials, tokens, patient data or identifiable records.
