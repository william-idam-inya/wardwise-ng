# Gemini integration for WardWise NG

This guide applies only to WardWise NG. The existing ClinClerk NG app and database are separate and must not be reused for this integration.

## Deployment status

The authenticated Supabase Edge Function `clinical-assistant` is deployed to project `ooutidbssimzvvgkinek` with JWT verification enabled.

Function URL:

`https://ooutidbssimzvvgkinek.supabase.co/functions/v1/clinical-assistant`

The deployed function is not yet AI-ready: the private `GEMINI_API_KEY` and exact permitted frontend origins still need to be configured as Supabase Edge Function secrets. Requests without the Gemini key return a controlled 503 response.

## Request flow

- Function source: `supabase/functions/clinical-assistant/index.ts`
- Browser service: `src/features/clerking/clinicalAssistant.service.ts`
- UI action: Ask for next question in the current clerking stage.

The function verifies the user's Supabase JWT, checks the operation and stage, enforces payload-size limits, calls Gemini with only the relevant stage context, validates model output against a response schema and returns one focused question. It does not save the clinical context or question to WardWise tables.

Supabase injects the project URL and public key set into Edge Function runtime variables. The function does not need a service-role key.

## Model and API

The current default model is `gemini-3.8-flash`, configurable using the server-side `GEMINI_MODEL` secret.

The function calls Google's Gemini Interactions API using JSON-schema constrained JSON output. It sets `store: false` to prevent the interaction being stored as an API resource for later retrieval. This is not a guarantee of zero provider-side processing or retention; review Google's current data-processing terms, retention rules and institutional governance before sending any clinical content.

The API version defaults to stable `v1` via `GEMINI_API_VERSION`. The function caps output at 500 tokens.

## Add the private secrets in Supabase Dashboard

1. Open [WardWise Edge Function Secrets](https://supabase.com/dashboard/project/ooutidbssimzvvgkinek/functions/secrets).
2. Add `GEMINI_API_KEY` and paste the key you generated in Google AI Studio.
3. Add `APP_ALLOWED_ORIGINS` with the exact origin(s) below. Separate multiple origins with semicolons; do not add URL paths or trailing slashes:

   `https://wardwise-ng.pages.dev;http://localhost:5173;http://127.0.0.1:5173`

4. Optionally set `GEMINI_MODEL` to `gemini-3.8-flash` and `GEMINI_API_VERSION` to `v1`. These are already the function defaults.
5. Save the secrets. Supabase Edge Functions read updated secrets without needing a redeployment.

A branch-preview URL will be different from the production Pages URL. Add its exact origin to `APP_ALLOWED_ORIGINS` after the Cloudflare preview deployment is available, if you want AI requests to work from that preview.

Never paste the Gemini key into this chat, GitHub, frontend source, a browser console, a `VITE_` variable or Cloudflare's public build variables. Only the Supabase Edge Function secret store should contain it.

## Privacy and clinical-safety boundaries

- Submit synthetic or properly de-identified cases only. Do not submit patient names, hospital numbers, phone numbers, addresses, exact dates of birth, identifiable photos or scans.
- The frontend sends only the current stage's limited context, not the complete clerking note or case label.
- The function rejects unexpected operations/stages and limits request size and model output size.
- The Edge Function does not log the submitted clinical narrative and does not persist the prompt or result in WardWise tables.
- `store: false` disables storage of the interaction for later API retrieval; it does not make a third-party AI request equivalent to an offline or institutionally approved clinical system.
- The best-effort request guard permits up to 12 requests per minute per user ID per Edge Function instance. Instances do not share the counter. This is not a durable distributed quota, budget or abuse-control system; implement shared rate limiting, budget alerts and monitoring before production.
- Model-generated questions and safety flags are educational suggestions, not diagnoses, clinical directives or verified facts. A qualified clinician must review representative outputs before release.
- The function has not yet undergone full live model evaluation, clinical prompt evaluation, institutional privacy assessment or production security review.

## Verification checklist

After the secrets and Auth URLs are configured, use synthetic cases only and verify:

1. A signed-in learner can request a question for a supported stage.
2. Requests without a valid user JWT are rejected.
3. Unsupported stages, malformed bodies and oversized payloads are rejected.
4. A missing Gemini key, timeout, quota response or malformed model output returns a clear error.
5. The learner's existing answers remain unchanged after every failure.
6. No Gemini key or service-role key appears in browser build output.
7. A clinician reviews outputs for history-taking relevance, false assumptions, red-flag handling and local practice context.

Do not mark this integration production-ready until these checks pass and clinician/institutional reviews are complete.
