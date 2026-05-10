# SpecForge Progress Tracker

## Current Phase

Phase 1 — Data Model & Security

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules

## In Progress

None.

## Next Up

- [ ] Chunk 04 — Database Schema and RLS

## Blocked

None.

## Recent Decisions

See `decisions.md`. Standards, backend provider mapping, CORS hardening, and component export convention decisions logged on 2026-05-10.

## Known Issues

- CORS currently allows `GET`, `POST`, and `OPTIONS`; add update/delete methods only when a future chunk introduces them.
- Validation responses currently return generic `{ code, message }`; add safe Zod issue details when a validation-heavy endpoint needs them.

## Notes for Next Agent

- Architecture is locked. Read `02-architecture.md` before starting Chunk 04.
- Do not deviate from the stack without updating `decisions.md` first.
- Frontend scaffold is complete. Logger and env access patterns are established — Chunk 02 should mirror them in `backend/_shared/`.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
- Standards and workflow rules are documented. Read `03-code-standards.md` and `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 0 is complete; Phase 1 begins with Chunk 04 (database schema and RLS).
