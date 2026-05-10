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

Real Supabase values are added after the Supabase project is created in Chunk 02.

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
