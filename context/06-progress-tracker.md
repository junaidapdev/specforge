# SpecForge Progress Tracker

## Current Phase

Phase 1 — Data Model & Security

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema and RLS

## In Progress

None.

## Next Up

- [ ] Chunk 05 — Supabase Auth Integration

## Blocked

- Full local Supabase `db reset` and two-user RLS verification are blocked until Docker Desktop is installed and running in the local environment.

## Recent Decisions

See `decisions.md`. Schema, RLS, hard-delete, cascade, check-constraint, backend provider mapping, CORS hardening, and component export convention decisions logged on 2026-05-10.

## Known Issues

- Chunk 04 migration has static checks only in this environment; run `cd backend && supabase db reset` and the two-user RLS verification before relying on it for production data.
- CORS currently allows `GET`, `POST`, and `OPTIONS`; add update/delete methods only when a future chunk introduces them.
- Validation responses currently return generic `{ code, message }`; add safe Zod issue details when a validation-heavy endpoint needs them.

## Notes for Next Agent

- Architecture is locked. Read `02-architecture.md` before starting Chunk 05.
- Do not deviate from the stack without updating `decisions.md` first.
- Frontend and backend scaffolds are complete. Keep established logger and env access patterns unchanged.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
- Standards and workflow rules are documented. Read `03-code-standards.md` and `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Schema and RLS are in place. Phase 1 continues with Chunk 05 (Supabase Auth integration on the frontend). The `handle_new_auth_user` trigger means the frontend does NOT need to insert into `public.users` after sign-up — Supabase does it automatically. Verify this in Chunk 05.
