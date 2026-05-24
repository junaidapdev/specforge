# SpecForge Progress Tracker

## Current Phase

Phase 5 — Build Support

Phase 4 — Build Planning is complete.

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
- [x] Chunk 08 — New Project Basic Details
- [x] Chunk 09 — Idea Clarifier
- [x] Chunk 10 — Project Brief Generator
- [x] Chunk 11 — Project Layout / Workspace Sidebar
- [x] Chunk 12 — Project Overview
- [x] Chunk 13 — PRD Generator
- [x] Chunk 14 — PRD Editor
- [x] Chunk 15 — Architecture Generator
- [x] Chunk 16 — Architecture Editor
- [x] Chunk 17 — Context Files Generator
- [x] Chunk 18 — Chunk Generator
- [x] Chunk 19 — Chunk Board
- [x] Chunk 20 — Feature Spec Generator
- [x] Chunk 21 — Agent Prompt Generator
- [x] Chunk 22 — Progress Tracker
- [x] Chunk 23 — Issue-to-Spec Converter

## In Progress

None.

## Next Up

- [ ] Chunk 24 — Knowledge Ingestion

## Blocked

None.

## Recent Decisions

See `decisions.md`. Schema, RLS, hard-delete, cascade, check-constraint, backend provider mapping, CORS hardening, component export convention, auth-flow decisions, app-shell decisions, dashboard data-path, pnpm cutover, the new-project persistence model, the idea-clarifier AI pattern, the brief persistence model (dual `content`/`content_json` storage, upsert + version + `is_final` reset), the brief approval flow (SPA-direct `supabase.rpc` over a `SECURITY INVOKER` stored procedure), the project_brief system prompt, the temporary OpenAI override for `project_brief` (Anthropic billing pending), the project layout/context pattern, the overview/stub-hook pattern, the PRD generation/approval model, the PRD section edit/regenerate pattern, and the chunk generation/ref/dependency model are logged.

## Known Issues

- `project_brief` is temporarily routed to OpenAI `gpt-4o` (instead of the architectural default Anthropic `claude-sonnet-4-6`) because the project's Anthropic billing has no credits. Documented in `decisions.md` (2026-05-13). When Anthropic is funded, revert: switch `provider`, swap `model` back to `ANTHROPIC_LONG_MODEL`, remove `responseFormat` in `backend/_shared/ai/config.ts`. Other long-form generations (PRD, architecture, etc.) still default to Anthropic and will hit the same wall when their chunks land if billing is still empty.
- The production bundle is ~1.07 MB / 309 kB gzipped after adding Markdown rendering — Vite emits a >500 kB chunk-size warning on `pnpm run build`. Code-splitting routes (lazy imports) is the right fix; defer to a perf-focused chunk.
- Project card chunk count, completion %, and open issues count are em-dash placeholders with tooltips that reference Chunks 18, 22, and 23 respectively. Replace with real data when those chunks land.
- Chunk 04 `supabase db reset` and two-user RLS verification passed locally on 2026-05-10.
- Local Supabase email confirmations are disabled in `backend/supabase/config.toml`; the frontend confirmation flow is implemented, but the local confirmation-email round trip needs a backend config follow-up or hosted Supabase verification.
- Google OAuth UI is implemented, but real OAuth round-trip verification requires Google provider credentials in Supabase.
- CORS currently allows `GET`, `POST`, and `OPTIONS`; add update/delete methods only when a future chunk introduces them.
- Validation responses currently return generic `{ code, message }`; add safe Zod issue details when a validation-heavy endpoint needs them.

## Notes for Next Agent

- Architecture is locked. Read `02-architecture.md` before starting any chunk.
- Do not deviate from the stack without updating `decisions.md` first.
- Frontend and backend scaffolds are complete. Keep established logger and env access patterns unchanged.
- Backend infra is in place. AI abstraction is in active use by Chunks 09 and 10. Provider mapping is set in `backend/_shared/ai/config.ts`; flipping a generation's provider is a one-line change.
- Standards and workflow rules are documented. Read `03-code-standards.md` and `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Schema and RLS are in place. The `handle_new_auth_user` trigger means the frontend does NOT insert into `public.users` after sign-up — Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. Do not duplicate auth logic — extend the existing context. The provider clears the React Query cache on sign-out, so any new query that holds user-owned data inherits that protection automatically.
- App shell is the chrome — every authenticated page renders inside `<AppShell>`. Sidebar items are configured in `frontend/src/components/layout/nav-config.ts`. To activate an inert item, remove its `pendingChunk` field.
- Dashboard pattern (Chunk 07): user-owned data reads go directly to Supabase via the JWT-scoped client, validated with Zod at the network boundary; no Edge Function. Mutations to `projects` (Chunks 08+) must invalidate the `['projects']` query key so the dashboard reflects them.
- Frontend package management is now pnpm-only. Use `corepack pnpm install`, `corepack pnpm run typecheck`, `corepack pnpm run lint`, and `corepack pnpm run build`. The npm lockfile is removed and `pnpm-lock.yaml` is committed.
- Project creation works end-to-end. Submitting the form lands on `/projects/{id}/clarify`, where Chunk 09 generates clarifying questions. The shared `@shared/schemas/project.ts` Zod schema is now established as the canonical pattern for cross-folder schema sharing. The new-project flow's persistence model is: project row at step 1; clarification answers in component state; brief persisted as `project_documents` row at the end (Chunk 10).
- AI feature pattern is now canonical: Edge Function template + per-function `deno.json` + `callEdgeFunction` helper + four-state UI + Zod-validated I/O on both sides. Used by Chunks 09 (clarifying questions) and 10 (brief). The `generation_logs` insert is a `// TODO(chunk-27)` across all AI chunks and will be picked up centrally in Chunk 27.
- Brief (Chunk 10) is the first persistent AI artifact. Pattern: dual `content` (Markdown) + `content_json` (structured) storage in `project_documents`, upsert on regeneration with `version` bump and `is_final` reset, transactional approval via the `approve_project_brief` Postgres function called directly from the SPA via `supabase.rpc` (no thin pass-through Edge Function). Project status now advances through user-approved gates: `idea → planning` (Chunk 10), then `planning → ready_to_build` (Chunk 18). PRD generation in Chunks 13/14 should reuse this persistence pattern but adds per-section regenerate.
- Auto-fire generation guard: when a page auto-generates content on first visit, gate the `useEffect` with a `useRef` flag (`hasFiredRef.current`) and narrow the effect's deps to the read-side query state only. Prevents React StrictMode's dev-only double-mount from firing two paid AI calls. See `BriefPage.tsx` for the canonical example.
- PRD is fully editable: per-section edit + per-section regenerate. The pattern is: SPA sends full `content_json` to a save Edge Function; the function renders markdown via a deterministic template (`backend/_shared/markdown/prd-markdown.ts`) and calls the `update_project_prd_content` stored procedure. Per-section regenerate has its own Edge Function that returns just the regenerated section; the SPA stitches and saves. The per-section regen pattern (separate `regenerate-X-section` Edge Function) is canonical for any future per-section AI feature.
- Architecture is fully editable: per-section edit + per-section regenerate + per-decision regenerate + a dedicated decision log management UI. Shared edit utilities live at `_shared/edit/`. The decisions array on `content_json.decisions` is the only source of truth for decisions across the app; the overview's `RecentDecisionsPanel` reads from it.
- Phase 3 complete. Brief, PRD, architecture, and context files are all generated, editable, and approvable. Context files use a different storage pattern from PRD/architecture: Markdown is the source of truth, there is no `content_json`, and each context file is its own `project_documents` row with a distinct type. Per-doc regenerate goes through `regenerate-context-doc`; bulk regenerate reuses `generate-context-files`. The progress tracker document generated by Chunk 17 is the live tracker the user maintains; chunks generation references it but does not modify it.
- Chunks generation works end-to-end. Project status advances `planning` -> `ready_to_build` on first generation. Bulk regeneration deletes existing chunks and cascades feature-spec deletion. Each chunk has a stable kebab-case `ref`, `included_features` pointing at PRD feature ids, and `dependencies` pointing at other chunk refs.
- Chunk board renders chunks as a Kanban with drag-and-drop. `@dnd-kit` is the canonical DnD library. Status changes go through the direct-RPC `move_chunk` stored procedure with optimistic updates and rollback on error; project status advancement now runs atomically inside that same procedure.
- Feature specs are generated and editable per section. The chunk detail page has Spec, Prompt, and Notes tabs. The feature-spec `content_json` shape is seven Markdown-string sections, which is intentionally simpler than the PRD and architecture shapes because feature specs are dense prose artifacts. Per-section edit uses a single textarea, matching the Chunk 17 context-file pattern.
- Agent prompts work for Claude Code, Cursor, and Generic targets. AI generates only the framing prose; the feature-spec body is inserted verbatim by the pure prompt assembler. The chunk detail page now has working Spec and Prompt tabs while Notes remains a placeholder.
- Progress tracker page is complete. Project status now advances `ready_to_build` -> `building` -> `completed` automatically through chunk moves and never reverses automatically. Sync to Markdown rewrites the Progress Tracker context file from live chunk state. Phase 4 is complete.
- Issues system is complete. Each issue persists its own AI-generated corrective prompt; an optional linked chunk adds feature-spec context to generation. Issues remain separate from the Kanban and status state machine. Phase 5 continues with Chunk 24: ingest pasted transcripts or notes and extract engineering lessons into `project_learnings`.
