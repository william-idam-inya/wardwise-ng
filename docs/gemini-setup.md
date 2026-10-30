# Gemini integration for WardWise NG

This guide applies only to WardWise NG. The existing ClinClerk NG app and project are separate and must not be reused for this integration.

## Request flow

The browser invokes the authenticated Supabase Edge Function:

- Function: supabase/functions/clinical-assistant/index.ts
- Browser service: src/features/clerking/clinicalAssistant.service.ts
- UI action: Ask for next question in the current clerking stage.

The Edge Function verifies the user's Supabase JWT, checks the operation and stage, enforces payload-size limits, calls Gemini with only the relevant stage context, validates the model output against a response schema, and returns one focused question. It does not save the clinical context or question to WardWise tables.

## Model and API

The current default model is gemini-3.8-flash, configurable using the server-side GEMINI_MODEL secret.

The function calls Google's Gemini Interactions API using JSON-schema constrained JSON output. It sets store: false to prevent the interaction being stored as an API resource for later retrieval. This setting is not a guarantee of zero provider-side retention; review Google's applicable data-processing terms, retention rules and institutional governance before sending any clinical content.

The API version defaults to the stable v1 endpoint via GEMINI_API_VERSION. The beta v1beta endpoint can be selected only if a future feature requires it and has been tested. Change it only after confirming the endpoint and model combination are supported and tested. The function caps output at 500 tokens.

## Create and configure secrets

After a separate WardWise Supabase project exists, create a local untracked secrets file such as supabase/functions/.env.local (the repository ignores .env.* files):

    GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
    GEMINI_MODEL=gemini-3.8-flash
    GEMINI_API_VERSION=v1
    APP_ALLOWED_ORIGINS=http://localhost:5173;https://YOUR_PUBLIC_APP_ORIGIN

Use your actual permitted app origins. Do not include URL paths or trailing slashes in an origin. The function permits local Vite development origins and only the exact additional origins in APP_ALLOWED_ORIGINS.

Set secrets and deploy:

    supabase secrets set --env-file supabase/functions/.env.local
    supabase functions deploy clinical-assistant

The function uses Supabase's project URL and publishable-key environment values to validate the caller's bearer token. It does not use a service-role key. JWT verification is enabled in supabase/config.toml.

Never place GEMINI_API_KEY in Vite .env.local, a VITE_ variable, a browser bundle, GitHub source or client-side configuration. Only the server-side Function secret store should contain it.

## Privacy and clinical-safety boundaries

- Submit synthetic or properly de-identified cases only. Do not submit patient names, hospital numbers, phone numbers, addresses, exact dates of birth, identifiable photos or scans.
- The frontend sends only the current stage's limited context, not the complete clerking note or the case label.
- The function rejects unexpected operations/stages and limits request size and model output size.
- The Edge Function does not log the submitted clinical narrative and does not persist the prompt or result in WardWise tables.
- store: false disables storage of the interaction for later API retrieval; it does not make a third-party AI request equivalent to an offline or institutionally approved clinical system.
- The best-effort request guard permits up to 12 requests per minute per user ID per Edge Function instance. Instances do not share the counter. This is not a durable distributed quota, budget or abuse-control system; implement shared rate limiting, budget alerts and monitoring before production.
- Model-generated questions and safety flags are educational suggestions, not diagnoses, clinical directives or verified facts. A qualified clinician must review representative outputs before release.
- The function has not yet undergone live deployment tests, clinical prompt evaluation, an institutional privacy assessment or a full production security review.

## Local function development and verification

With a NEW WardWise project linked through the Supabase CLI:

    supabase functions serve clinical-assistant --env-file supabase/functions/.env.local

Run the frontend with that project's public URL and publishable key in .env.local. Use synthetic cases only. Verify:

1. A signed-in learner can request a question for a supported stage.
2. Requests without a valid user JWT are rejected.
3. Unsupported stages, malformed bodies and oversized payloads are rejected.
4. A missing Gemini key, timeout, quota response or malformed model output returns a clear error.
5. The learner's existing answers remain unchanged after every failure.
6. No Gemini key or service-role key appears in browser build output.
7. A clinician reviews outputs for history-taking relevance, false assumptions, red-flag handling and local practice context.

Do not mark this integration live until the Edge Function is deployed to the separate WardWise project and these checks have passed.
