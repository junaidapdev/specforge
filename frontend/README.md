# SpecForge Frontend

SpecForge frontend is a Vite + React + TypeScript SPA for the SpecForge planning and memory workspace.

## Prerequisites

- Node.js `>=20`
- npm `>=10`

## Setup

```bash
cd frontend
npm install
```

## Environment

Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key.

```bash
cp .env.example .env.local
```

For local Supabase, use the Project URL and publishable/anon key printed by
`cd ../backend && supabase start`.

## Auth Local Setup

Email/password auth is enabled by default when local Supabase is running. Confirmation emails are delivered to Mailpit at `http://localhost:54324`; open Mailpit during local testing and click the confirmation link from there.

Google OAuth requires a real Google OAuth client ID and secret:

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID for a web application.
5. Add `http://localhost:54321/auth/v1/callback` as an authorized redirect URI for local development.
6. Add the Google client ID and secret to `backend/supabase/config.toml` or your Supabase project dashboard under Authentication -> Providers -> Google.
7. Restart local Supabase after changing local provider config.

The frontend does not need Google-specific environment variables. OAuth redirects back to `/auth/callback` in the SPA.

## Scripts

- `npm run dev` - start the local Vite dev server.
- `npm run build` - typecheck and build for production.
- `npm run preview` - preview the production build locally.
- `npm run lint` - run ESLint with zero warnings allowed.
- `npm run lint:fix` - run ESLint and apply safe fixes.
- `npm run format` - format the frontend with Prettier.
- `npm run typecheck` - run TypeScript checks.

## Folder Structure

- `src/components/` - shadcn/ui primitives and composed components.
- `src/features/` - feature-specific modules added in later chunks.
- `src/lib/` - logger, Supabase client, and shared utilities.
- `src/config/` - typed environment access.
- `src/constants/` - route constants and user-facing errors.
- `src/hooks/` - shared hooks added in later chunks.
- `src/types/` - frontend-specific shared types.
- `src/pages/` - route-level components.

## Code Rules

The logger is the only place `console.*` may be called. `any` is forbidden in committed frontend code; use `unknown` and narrow it.

Auth code uses `useAuth()` from `src/features/auth/useAuth.ts`. Do not duplicate direct Supabase auth state handling in feature pages.
