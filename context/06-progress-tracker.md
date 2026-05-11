# SpecForge Progress Tracker

## Current Phase

Phase 2 — Authentication & App Shell

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema and RLS
- [x] Chunk 05 — Supabase Auth Integration

## In Progress

None.

## Next Up

- [ ] Chunk 06 — App Shell

## Blocked

None.

## Recent Decisions

See `decisions.md`. Schema, RLS, hard-delete, cascade, check-constraint, backend provider mapping, CORS hardening, component export convention, and auth-flow decisions logged on 2026-05-10.

## Known Issues

- Chunk 04 `supabase db reset` and two-user RLS verification passed locally on 2026-05-10.
- Local Supabase email confirmations are disabled in `backend/supabase/config.toml`; the frontend confirmation flow is implemented, but the local confirmation-email round trip needs a backend config follow-up or hosted Supabase verification.
- Google OAuth UI is implemented, but real OAuth round-trip verification requires Google provider credentials in Supabase.
- CORS currently allows `GET`, `POST`, and `OPTIONS`; add update/delete methods only when a future chunk introduces them.
- Validation responses currently return generic `{ code, message }`; add safe Zod issue details when a validation-heavy endpoint needs them.

## Notes for Next Agent

- Architecture is locked. Read `02-architecture.md` before starting Chunk 06.
- Do not deviate from the stack without updating `decisions.md` first.
- Frontend and backend scaffolds are complete. Keep established logger and env access patterns unchanged.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
- Standards and workflow rules are documented. Read `03-code-standards.md` and `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Schema and RLS are in place. The `handle_new_auth_user` trigger means the frontend does NOT insert into `public.users` after sign-up — Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. The placeholder `/dashboard` route inside a `RequireAuth` wrapper exists in `App.tsx` — Chunk 06 will replace it with the real app shell. Do not duplicate auth logic — extend the existing context.
