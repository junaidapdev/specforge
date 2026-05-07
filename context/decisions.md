# SpecForge Decision Log

## 2026-05-07 — Single Repo with frontend/ and backend/

**Decision:** Repository structure: Single repo, two top-level folders: `frontend/` and `backend/`.
**Reason:** A single repo keeps context, specs, frontend work, backend work, and migrations together for solo-dev velocity.
**Alternatives considered:** Two separate repos for frontend and backend; a single mixed folder with no runtime boundary.
**Reversibility:** Hard

## 2026-05-07 — Vite + React SPA

**Decision:** Frontend: Vite + React + TypeScript SPA. No Next.js. No SSR.
**Reason:** SpecForge does not need SSR for the MVP, and a Vite SPA keeps the app simple, fast, and aligned with Supabase client-side auth.
**Alternatives considered:** Next.js App Router, Remix, Astro, and server-rendered React.
**Reversibility:** Hard

## 2026-05-07 — Supabase Edge Functions Backend

**Decision:** Backend: Supabase Edge Functions (Deno runtime). No separate Node backend. No Express, no Fastify, no custom server.
**Reason:** Edge Functions keep secret-bearing work close to Supabase Auth and Postgres without introducing a second backend deployment surface.
**Alternatives considered:** Express, Fastify, Next.js API routes, a custom Node service, and serverless functions on the SPA host.
**Reversibility:** Hard

## 2026-05-07 — Supabase Postgres with RLS

**Decision:** Database: Supabase Postgres. Authorization enforced via Row Level Security (RLS).
**Reason:** RLS gives SpecForge a database-enforced isolation layer for private projects and user-owned documents.
**Alternatives considered:** Prisma-managed Postgres without RLS, Firebase, SQLite, and a custom authorization layer in application code.
**Reversibility:** Hard

## 2026-05-07 — Supabase Auth with Email and Google

**Decision:** Auth: Supabase Auth. Methods enabled: email/password and Google OAuth. No Clerk.
**Reason:** Supabase Auth integrates directly with Postgres RLS and avoids adding a separate identity provider for the MVP.
**Alternatives considered:** Clerk, Auth0, NextAuth, magic-link-only auth, and email/password-only auth.
**Reversibility:** Hard

## 2026-05-07 — OpenAI and Anthropic Behind One Abstraction

**Decision:** AI providers: Both OpenAI and Anthropic. All AI calls go through a single abstraction in `backend/_shared/ai/` exposing `generate(type, input)`. Provider selection per generation type is configured in one file.
**Reason:** A single generation boundary prevents provider-specific logic from leaking into features and makes provider switching a one-line config change.
**Alternatives considered:** OpenAI only, Anthropic only, direct provider calls from each feature, and frontend-side AI calls.
**Reversibility:** Easy

## 2026-05-07 — Zod Validation Shared Across Boundaries

**Decision:** Validation: Zod. Shared schemas live in `backend/_shared/schemas/` and are imported by `frontend/` via relative path.
**Reason:** Shared schemas prevent validation drift between forms and Edge Function boundaries.
**Alternatives considered:** Separate frontend and backend schemas, TypeBox, Valibot, Yup, and hand-written validation.
**Reversibility:** Hard

## 2026-05-07 — Tailwind CSS and shadcn/ui

**Decision:** Styling: Tailwind CSS + shadcn/ui.
**Reason:** Tailwind and shadcn/ui support a clean SaaS interface with accessible primitives and predictable composition.
**Alternatives considered:** CSS Modules, Chakra UI, Mantine, Material UI, and custom CSS only.
**Reversibility:** Hard

## 2026-05-07 — Tiny Custom Logger and no console.log

**Decision:** Logger: Tiny custom wrapper (~20 lines), mirrored in `frontend/src/lib/logger.ts` and `backend/_shared/logger.ts`. `console.log` is forbidden in committed code; ESLint enforces this.
**Reason:** A tiny wrapper keeps logging behavior consistent without introducing a logging dependency before the MVP needs one.
**Alternatives considered:** Direct console usage, Pino, Winston, Logtail, Sentry-only logging, and no logging abstraction.
**Reversibility:** Easy

## 2026-05-07 — Separate SPA and Supabase Deploys

**Decision:** Deployment: SPA → Vercel or Netlify. Edge Functions → Supabase. Two separate deploys.
**Reason:** The frontend and Edge Functions have different platforms, runtimes, commands, and release concerns.
**Alternatives considered:** Deploy everything on Vercel, deploy a custom backend server, or host the SPA inside a backend service.
**Reversibility:** Hard

## 2026-05-07 — Deviation from Code Review Item #5

**Decision:** Repo deviation from code review item #5: The code review recommended two separate repos for frontend and backend. We are using a single repo with two folders instead, for solo-dev velocity.
**Reason:** The MVP is being built by a solo developer, so one repo reduces coordination overhead, keeps chunk reviews simple, and keeps documentation near implementation.
**Alternatives considered:** Two separate GitHub repositories with independent issues, PRs, CI workflows, and release histories.
**Reversibility:** Hard
