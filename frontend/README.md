# SpecForge Frontend

SpecForge frontend is a Vite + React + TypeScript SPA for the SpecForge planning and memory workspace.

## Prerequisites

- Node.js `>=20`
- pnpm `>=10.16`

## Setup

```bash
cd frontend
pnpm install
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

- `pnpm run dev` - start the local Vite dev server.
- `pnpm run build` - typecheck and build for production.
- `pnpm run preview` - preview the production build locally.
- `pnpm run lint` - run ESLint with zero warnings allowed.
- `pnpm run lint:fix` - run ESLint and apply safe fixes.
- `pnpm run format` - format the frontend with Prettier.
- `pnpm run typecheck` - run TypeScript checks.

## Folder Structure

- `src/components/` - shadcn/ui primitives and composed components.
- `src/features/` - feature-specific modules added in later chunks.
- `src/lib/` - logger, Supabase client, and shared utilities.
- `src/config/` - typed environment access.
- `src/constants/` - route constants and user-facing errors.
- `src/hooks/` - shared hooks added in later chunks.
- `src/types/` - frontend-specific shared types.
- `src/pages/` - route-level components.

## App Shell

Authenticated pages render inside `src/components/layout/AppShell.tsx`. The shell owns the
top header, left sidebar, mobile navigation drawer, and the global error boundary fallback.

Sidebar items are configured in `src/components/layout/nav-config.ts`. Add or update a sidebar
item there instead of hardcoding links inside layout JSX.

Navigation items with `pendingChunk` render as inert controls with a tooltip. When the feature
route is implemented in its chunk, remove `pendingChunk` from the matching config item.

## Shared Schemas

The frontend can import Zod schemas from `backend/_shared/schemas/` through the `@shared`
alias. This is the only allowed cross-folder import pattern.

```ts
import { ProjectCreateSchema } from '@shared/schemas/project';
```

Do not import backend runtime helpers, auth utilities, AI clients, loggers, or secret-bearing
code into the frontend.

## Form Pattern

Feature forms use shadcn Form primitives with `react-hook-form`, `@hookform/resolvers`, and
shared Zod schemas. Keep the submit side effect in a React Query mutation hook, and keep the
page component focused on layout and state composition.

## Code Rules

The logger is the only place `console.*` may be called. `any` is forbidden in committed frontend code; use `unknown` and narrow it.

Auth code uses `useAuth()` from `src/features/auth/useAuth.ts`. Do not duplicate direct Supabase auth state handling in feature pages.

Use `pnpm` for frontend package work. The root `pnpm-workspace.yaml` sets
`minimumReleaseAge: 10080`, which means pnpm waits 7 days after a package version
is published before installing it.
