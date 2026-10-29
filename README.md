# WardWise NG

**Clinical learning, guided clerking and virtual-patient simulation for medical students.**

WardWise NG is an educational platform being built for medical and surgery students, especially those training in Nigerian medical schools and teaching hospitals. It is not a licensed clinician or a substitute for clinical supervision.

## Product areas
- Workspace: study shortcuts, case-library empty state, preferences and account access.
- AI Guided Clinical Clerking: biodata, a separate history for each presenting complaint, review of systems, examination, investigations, assessment and plan.
- Clinical Tutor: focused learning guides and reasoning frameworks.
- Virtual Patient Simulation: consistent fictional scenarios and examiner feedback.
- Case Library: private save, reopen, edit, archive/delete and export.
- Learning Catalogue: browse/search by discipline, specialty and topic.

## Current delivery status
The feature/app-foundation branch contains Milestone 0. It establishes responsive navigation, the design system, light/dark theme, Workspace, a catalogue starter structure, reusable status indicator and test setup. Authentication, durable case saving, AI calls and complete interactive clerking are not connected yet. The interface deliberately says so rather than claiming data has been saved or generated.

## Stack
React, TypeScript, Vite, Vitest, React Testing Library; Supabase for authentication, PostgreSQL, row-level security and Edge Functions (planned); Google Gemini through a server-side function only (planned); Cloudflare for hosting.

## Local setup
Use Node.js 20.19+ (Node 22 recommended) and npm. Clone the repository, run npm install, copy .env.example to .env.local, then run npm run dev. The current foundation works without Supabase credentials.

Quality checks: npm run lint, npm run typecheck, npm test, npm run build.

## Secrets
Only public Supabase browser configuration belongs in .env.local: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or a supported publishable key). Anything prefixed VITE_ is bundled into the browser. Never put GEMINI_API_KEY or SUPABASE_SERVICE_ROLE_KEY in browser variables, commit them to Git or hard-code them. Gemini calls must run server-side using managed secrets.

Use a new Supabase project for WardWise NG by default. Do not reuse, reset or delete the ClinClerk NG database. User-specific tables require row-level security and owner-based policies before private records are enabled.

## Clinical and privacy rules
1. Use synthetic or properly de-identified cases only. Do not enter patient names, phone numbers, hospital numbers, addresses, identifiable photos/scans or other identifiers without formal authorisation and an approved lawful basis.
2. Separate supplied facts, clinical interpretation and missing information.
3. Never turn an unanswered question into a negative finding. Mark missing, not elicited, not known, not applicable and not performed accurately.
4. Each presenting complaint has its own history using **Complaint, Course, Cause/context, Complications and Care received**, plus symptom-specific questions.
5. Review of systems is distinct. Examination findings and interpretations stay separate. Never invent findings, test results, patient answers or dates.
6. AI output is educational and must be checked against current references, local protocols and clinical supervisors.
7. Use meaningful event-confirmed processing stages. Never show fabricated percentages or timer-driven progress.

## Roadmap
- [x] Milestone 0 — app foundation and navigation
- [ ] Milestone 1 — Supabase authentication, profile and row-level security
- [ ] Milestone 2 — data-backed Workspace
- [ ] Milestone 3 — guided clerking and live note preview
- [ ] Milestone 4 — case persistence, edit/reopen/delete and export
- [ ] Milestone 5 — secure Gemini Edge Function and response validation
- [ ] Milestone 6 — Clinical Tutor and expanded catalogue
- [ ] Milestone 7 — virtual patient and examiner rubric
- [ ] Milestone 8 — accessibility, security, E2E tests and release

Review each milestone with real test results before proceeding. Do not claim deployment, database isolation or clinical validation until those checks pass.
