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
- **Milestone 0 — Foundation:** app shell, responsive navigation, Workspace, light/dark theme, starter catalogue, accessible status indicator and initial tests.
- **Milestone 1 — Auth/profile implementation:** Supabase client, email/password registration and sign-in, password reset/recovery, profile setup/editing, profile fetch, a profiles SQL migration, and owner-based row-level security are implemented in code.
- **Milestone 3 — Guided clerking:** a 13-stage form covers separate complaint histories, ROS, past/family/social history, examination, investigations, assessment, plan and note review. Note output begins with an “I present…” statement composed only from entered biodata and can be printed / saved as PDF. The draft records whether each ROS system was actually reviewed and does not transform unanswered items into negatives.
- **Milestone 4 — Case Library:** private case and session tables, RLS migrations, save/reopen/edit/duplicate-as-new/archive/delete services, and recent-case shortcuts are implemented in code.
- **Milestone 5 — Gemini question facilitator:** an authenticated Supabase Edge Function, stage-aware context builder, JSON-schema response validation, request-size limits, server-side API key use, and a one-question action in the clerking UI are implemented in code. Deployment, model compatibility tests, durable quotas and clinician-led safety evaluation remain pending.
- **Milestone 6 — Clinical Tutor:** five source-linked offline guides (jaundice, paediatric UTI, acute abdominal pain, appendicitis and posterior urethral valves), focused history/examination/investigation prompts, differential frameworks, management principles, escalation features and interactive knowledge checks are implemented. The catalogue browses disciplines, specialty groups and presentations with integrated alias search. Independent clinician review and further guide coverage remain pending.
- **Milestone 7 — Virtual Patient Simulation:** two scripted fictional scenarios, explicit examination/investigation disclosure on request, unknown-detail fallback, domain coverage and a post-interview rubric covering examination, differentials and reasoning are implemented. The rubric is formative and not a validated OSCE score.
- **Backend connection:** not yet complete. The connected Supabase account currently has the existing ClinClerk NG project only. WardWise must use a new, separate Supabase project. The migrations have not been applied and live auth/database tests have not yet run.
- Profile & settings now disclose backend readiness, AI data flow, retention/deletion limitations and the prohibition on identifiable patient information. A content issue report can be drafted/copied, but no receiving endpoint is yet connected.
- The app keeps the private workspace locked when Supabase public configuration is missing. It does not silently fall back to demo/private data. Gemini credentials are not included in browser code.

## Technology
- React + TypeScript + Vite
- Supabase JS 2.95.0 (exact version) for browser authentication and the Data API
- Supabase PostgreSQL and RLS migrations
- Vitest + React Testing Library
- Google Gemini Interactions API through an authenticated Supabase Edge Function
- Cloudflare Workers static assets for hosting

## Local setup
Use Node.js 20.19+ (Node 22 recommended) and npm.

1. Clone this repository and check out the feature branch while it is under review:
   git clone --branch feature/app-foundation https://github.com/william-idam-inya/wardwise-ng.git
2. Enter this repository folder and run npm install.
3. Copy .env.example to .env.local.
4. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from the NEW WardWise project.
5. Run npm run dev and open the local URL printed by Vite.

Never put a Gemini key, Supabase service-role key or Supabase secret key in a VITE_ variable. Those values are bundled into the browser. The frontend intentionally uses only the public/publishable key. Read docs/supabase-setup.md and docs/gemini-setup.md before connecting/deploying backend features.

## Quality checks
Run npm run lint, npm run typecheck, npm test and npm run build. CI runs these on pushes and pull requests. Do not treat a configured workflow as proof of passing tests; inspect the actual workflow run.

## Database boundary and security
Use a NEW Supabase project for WardWise NG. Do not reuse, reset, pause or delete the existing ClinClerk NG project. Initial migrations:
- supabase/migrations/20261030000000_create_profiles.sql
- supabase/migrations/20261030010000_create_clinical_cases.sql

The profile table has RLS policies for select/insert/update/delete so each signed-in user can access only the row whose id equals auth.uid(). Explicit table grants accompany RLS because Supabase's Data API no longer exposes newly-created public tables by default from 30 October 2026. Do not remove those grants/policies without reviewing the access model.

The current profile stores name, optional sex, optional age in years, study level, institution and optional training site. It deliberately does not collect a date of birth. Clinical cases and clerking sessions use owner IDs, explicit grants, RLS policies, indices and a composite owner-bound foreign key. Two-user isolation remains unverified until a WardWise project is available.

## Clinical and privacy rules
1. Use synthetic or properly de-identified cases only. Do not enter patient names, phone numbers, hospital numbers, addresses, identifiable photos/scans or other identifiers without formal authorisation and an approved lawful basis.
2. Separate supplied facts, clinical interpretation and missing information.
3. Never turn an unanswered question into a negative finding. Mark missing, not elicited, not known, not applicable and not performed accurately.
4. Each presenting complaint has its own history using **Complaint, Course, Cause/context, Complications and Care received**, with symptom-specific questions.
5. Review of systems is a distinct section. Examination findings and interpretation stay separate. Never invent findings, test results, patient answers or dates.
6. AI output is educational and must be checked against current references, local protocols and clinical supervisors.
7. Show meaningful event-confirmed processing stages. Never show fabricated percentages or timer-driven progress.

## Roadmap
- [x] Milestone 0 — app foundation and navigation
- [ ] Milestone 1 — authentication/profile code and initial RLS migration (remote setup and verification pending)
- [ ] Milestone 2 — data-backed Workspace
- [ ] Milestone 3 — AI follow-up questions, clinical validation and live note preview (13-stage structured workflow committed; Gemini prompt evaluation pending)
- [x] Milestone 4 — case persistence code, edit/reopen/archive/delete (remote RLS tests and export pending)
- [ ] Milestone 5 — deploy/test Gemini Edge Function, implement durable quotas and complete clinical safety evaluation (function and frontend integration code committed)
- [ ] Milestone 6 — independent clinical review and expand source-linked Clinical Tutor coverage (five offline starter guides implemented)
- [ ] Milestone 7 — clinician-review and expand the Virtual Patient Simulation library/rubric (two scripted scenarios implemented)
- [ ] Milestone 8 — accessibility, security, end-to-end tests and release

Review each milestone with real test results before proceeding. Do not claim deployment, database isolation or clinical validation until those checks pass.
