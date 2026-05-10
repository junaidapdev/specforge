# SpecForge Backend

SpecForge backend is a Supabase Edge Functions project for server-side auth checks, AI provider
calls, migrations, and shared Deno utilities.

## Prerequisites

- Supabase CLI `>=2.90`
- Deno `>=2`

Install the Supabase CLI using the official Supabase CLI installation guide. On macOS with Homebrew:

```bash
brew install supabase/tap/supabase
```

Install Deno:

```bash
brew install deno
```

## Setup

```bash
cd backend
supabase start
```

Local Supabase API and Edge Function routes use the local API port from `supabase/config.toml`.

## Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Required secrets:

```bash
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_ANON_KEY=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set OPENAI_API_KEY=...
supabase secrets set ANTHROPIC_API_KEY=...
supabase secrets set ENVIRONMENT=development
supabase secrets set AI_TEST_ENABLED=false
supabase secrets set ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`AI_TEST_ENABLED` should stay unset or `false` in production. The `ai-test` function is a diagnostic
endpoint only.

Production must set an explicit `ALLOWED_ORIGINS` value. Development may use `*`, but this is a
Chunk 31 hardening item.

## Local Edge Function Development

Serve functions locally:

```bash
supabase functions serve --env-file .env.local
```

Example health check:

```bash
curl http://127.0.0.1:54321/functions/v1/health
```

Deploy one function:

```bash
supabase functions deploy health
```

## Folder Structure

- `_shared/ai/` - provider config, OpenAI/Anthropic clients, and public `generate` abstraction.
- `_shared/auth/` - JWT auth verification helpers.
- `_shared/constants/` - error codes/messages and HTTP status constants.
- `_shared/http/` - CORS and response envelope helpers.
- `_shared/schemas/` - shared Zod schemas populated by feature chunks.
- `functions/health/` - reference health/auth Edge Function.
- `functions/ai-test/` - gated diagnostic AI wiring Edge Function.
- `supabase/migrations/` - database migrations added in Chunk 04.

## Backend Rules

- Every Edge Function returns the standard envelope:
  `{ ok: true, data } | { ok: false, error: { code, message } }`.
- Validate external input with Zod at the function boundary.
- Authenticate private operations with the JWT from `Authorization: Bearer <token>`.
- Use the user's JWT for user-data queries. Never use the service role key for user data.
- The service role key is reserved for system-level operations.
- Do not call `console.*` outside `_shared/logger.ts`.
- Do not use `any`; use `unknown` and narrow it.
- Do not log env values, JWTs, full request bodies, full user objects, or AI API responses.

## Adding a New Edge Function

1. Create `functions/<function-name>/index.ts`.
2. Handle CORS preflight first with `handleCorsPreflight(req)`.
3. Validate method and input with constants and Zod.
4. Call `requireAuth(req)` for authenticated routes.
5. Return responses through `ok`, `created`, or `fail`.
6. Wrap the handler in a top-level `try/catch`.
7. Use `logger` only for safe operational messages.

## Tasks

```bash
deno task check
deno task lint
deno task fmt
deno task fmt:check
```
