# SpecForge Progress Tracker

## Current Phase

Phase 3 — Dashboard & Project Creation

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema and RLS
- [x] Chunk 05 — Supabase Auth Integration
- [x] Chunk 06 — App Shell & Protected Routing
- [x] Chunk 07 — Dashboard
- [x] Chunk 07.5 — pnpm Cutover

## In Progress

None.

## Next Up

- [ ] Chunk 08 — Project Creation

## Blocked

None.

## Recent Decisions

See `decisions.md`. Schema, RLS, hard-delete, cascade, check-constraint, backend provider mapping, CORS hardening, component export convention, auth-flow decisions, app-shell decisions, dashboard data-path (Supabase JS direct read with Zod validation, no Edge Function), and the pnpm cutover are logged.

## Known Issues

- The production bundle is ~699 kB / 204 kB gzipped — Vite emits a >500 kB chunk-size warning on `pnpm run build`. Code-splitting routes (lazy imports) is the right fix; defer to a perf-focused chunk.
- Project card chunk count, completion %, and open issues count are em-dash placeholders with tooltips that reference Chunks 18, 22, and 23 respectively. Replace with real data when those chunks land.
- Chunk 04 `supabase db reset` and two-user RLS verification passed locally on 2026-05-10.
- Local Supabase email confirmations are disabled in `backend/supabase/config.toml`; the frontend confirmation flow is implemented, but the local confirmation-email round trip needs a backend config follow-up or hosted Supabase verification.
- Google OAuth UI is implemented, but real OAuth round-trip verification requires Google provider credentials in Supabase.
- Chunk 06 project-mode route at `/projects/:id/*` is a temporary shell stub for sidebar verification and should be replaced by the real project layout in Chunk 11.
- CORS currently allows `GET`, `POST`, and `OPTIONS`; add update/delete methods only when a future chunk introduces them.
- Validation responses currently return generic `{ code, message }`; add safe Zod issue details when a validation-heavy endpoint needs them.

## Notes for Next Agent

- Architecture is locked. Read `02-architecture.md` before starting any chunk.
- Do not deviate from the stack without updating `decisions.md` first.
- Frontend and backend scaffolds are complete. Keep established logger and env access patterns unchanged.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
- Standards and workflow rules are documented. Read `03-code-standards.md` and `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Schema and RLS are in place. The `handle_new_auth_user` trigger means the frontend does NOT insert into `public.users` after sign-up — Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. Do not duplicate auth logic — extend the existing context. The provider clears the React Query cache on sign-out, so any new query that holds user-owned data inherits that protection automatically.
- App shell is the chrome — every authenticated page renders inside `<AppShell>`. Sidebar items are configured in `frontend/src/components/layout/nav-config.ts`. To activate an inert item, remove its `pendingChunk` field. The project-mode sidebar stub at `/projects/:id/*` is temporary and will be replaced in Chunk 11. The breadcrumb shows a placeholder project name; replace with a real fetch in Chunk 11.
- Dashboard pattern (Chunk 07): user-owned data reads go directly to Supabase via the JWT-scoped client, validated with Zod at the network boundary; no Edge Function. Mutations to `projects` (Chunks 08+) must invalidate the `['projects']` query key so the dashboard reflects them.
- Frontend package management is now pnpm-only. Use `corepack pnpm install`, `corepack pnpm run typecheck`, `corepack pnpm run lint`, and `corepack pnpm run build`. The npm lockfile is removed and `pnpm-lock.yaml` is committed.
- Chunk 08 owns the `/projects/new` route and project creation flow. After a project is created, invalidate the dashboard `['projects']` query key before navigating back to `/dashboard` or into the project workspace.
