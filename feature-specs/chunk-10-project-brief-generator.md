# Chunk 10 — Project Brief Generator

## Goal

Generate a structured project brief from a project's basic details and the user's clarification answers, persist it as the first AI-generated document in `project_documents`, and render it on `/projects/:id/brief`. This chunk establishes the dual-storage pattern (`content` Markdown + `content_json` structured) and the transactional approval pattern (Postgres stored procedure) that every later document chunk reuses.

## Acceptance Criteria

### Backend
- [x] Stored procedure `public.approve_project_brief(p_project_id uuid)` exists. `SECURITY INVOKER`, ownership double-check, atomic flip of `project_documents.is_final` and gated `projects.status` advance from `'idea'` to `'planning'`.
- [x] `_shared/schemas/brief.ts` exports `ProjectBriefContentSchema`, `ProjectBriefModelOutputSchema`, `GenerateProjectBriefInputSchema`, and inferred types.
- [x] `_shared/ai/config.ts` has the real `PROJECT_BRIEF_SYSTEM_PROMPT` and a wired `project_brief` config entry.
- [x] `functions/generate-project-brief/index.ts` follows the Chunk 09 template: CORS preflight, JWT auth, Zod input/output validation, JWT-scoped Supabase client for both reads and writes, structured logging with `// TODO(chunk-27)`, standard error envelopes.
- [x] `functions/generate-project-brief/deno.json` defines per-function imports (Supabase CLI no longer accepts `--import-map`).
- [x] `deno task check`, `lint`, `fmt:check` all pass.

### Edge Function manual tests
- [x] Bare POST without JWT → `401 UNAUTHORIZED` with the standard envelope.
- [x] Cold-start CORS preflight succeeds (function deployed with `--no-verify-jwt`).
- [x] Valid input with answers → `200`, brief generated and stored, `version=1`, `is_final=false`.
- [x] Valid input without answers → `200`, brief generated with assumptions filled in.
- [x] Second call for the same project → `200`, brief replaced; `version` advances; `is_final` resets.
- [x] Returned envelope shape: `{ ok: true, data: { brief: {...} } }`.

### Stored procedure manual tests
- [x] Owning user approves their own brief → succeeds; `is_final = true`; `projects.status` advances from `idea → planning`.
- [x] Re-approving an already-approved brief is a no-op for status (gated by `status = 'idea'`); `is_final` remains `true`.
- [x] Cross-user attempt rejected by the explicit ownership check (and by RLS as a second layer).

### Frontend
- [x] `corepack pnpm run typecheck`, `lint`, `build` all pass.
- [x] `/projects/:id/brief` renders inside `<AppShell>` behind `<RequireAuth>`.
- [x] First visit with answers in `location.state` → auto-fires generation → pending → BriefView.
- [x] First visit without answers → auto-fires generation → pending → BriefView (assumptions filled in).
- [x] Return visit (existing brief) → loads existing brief immediately, no regeneration.
- [x] Brief renders all seven sections + optional Assumptions; empty arrays render `(none yet)`.
- [x] Tech stack rendered as a label/value grid plus optional "Other" and "Tech assumptions" sub-blocks.
- [x] Approve button → green banner appears → project status advances (verified on dashboard).
- [x] Regenerate confirmation dialog → confirming triggers regeneration → new content displayed → approved state reset.
- [x] Error state with retry works for both generation failures and existing-brief fetch failures.
- [x] Auto-fire `useEffect` does not double-fire under StrictMode (guarded by `useRef`).

### Standards
- [x] No `console.*` outside `lib/logger.ts`.
- [x] No `any`. AI output Zod-validated server-side, response Zod-validated frontend-side.
- [x] All copy lives in `features/projects/brief/messages.ts`.
- [x] No hardcoded color hex; success banner uses semantic `green-600`/`green-500` tokens.
- [x] React Query cache invalidations are precise (`briefQueryKey(projectId)` and `projectsQueryKey`); no global `clear()`.

## Files Touched

Added:
- `backend/supabase/migrations/20260513150000_brief_approval_procedure.sql`
- `backend/_shared/schemas/brief.ts`
- `backend/functions/generate-project-brief/index.ts`
- `backend/functions/generate-project-brief/deno.json`
- `frontend/src/components/ui/alert-dialog.tsx`
- `frontend/src/features/projects/brief/BriefPage.tsx`
- `frontend/src/features/projects/brief/BriefView.tsx`
- `frontend/src/features/projects/brief/BriefSection.tsx`
- `frontend/src/features/projects/brief/BriefActions.tsx`
- `frontend/src/features/projects/brief/BriefPending.tsx`
- `frontend/src/features/projects/brief/BriefError.tsx`
- `frontend/src/features/projects/brief/useExistingBrief.ts`
- `frontend/src/features/projects/brief/useGenerateBrief.ts`
- `frontend/src/features/projects/brief/useApproveBrief.ts`
- `frontend/src/features/projects/brief/messages.ts`

Modified:
- `backend/_shared/ai/config.ts` — added `OPENAI_LONG_MODEL` constant, `PROJECT_BRIEF_SYSTEM_PROMPT`, and routed `project_brief` to OpenAI `gpt-4o` with `responseFormat: 'json_object'` (override decision logged).
- `frontend/src/App.tsx` — wired the brief route between clarify and the project-workspace catch-all.
- `frontend/package.json` — added `@radix-ui/react-alert-dialog@1.1.15`.

## Out of Scope

- **Free-text editor for the brief.** Display + regenerate only. Per-section editing comes in PRD/architecture chunks.
- **Version history UI.** The `version` column tracks regenerations but isn't surfaced.
- **Project layout / sidebar.** Owned by Chunk 11; brief renders inside the existing `<AppShell>` directly for now.
- **PRD or architecture generation.** Chunks 13+.
- **Per-section regeneration.** Whole-brief only.
- **Markdown export.** `content_markdown` is stored but not surfaced; pickup in Chunk 25.
- **Diff view across versions.** Latest only.
- **Streaming responses.** Not in MVP.

## Notes for Future Agents

- Brief is the first persistent AI artifact and establishes patterns to mirror:
  - **Dual storage:** `content` (rendered Markdown for export) + `content_json` (structured object for the renderer). Same shape will be used for PRD and architecture.
  - **Upsert on regeneration:** `(project_id, type)` unique constraint makes upsert clean. `version` bumps; `is_final` resets to `false`. No version history table.
  - **Transactional approval via stored procedure:** `SECURITY INVOKER` so RLS still applies; called from the SPA via `supabase.rpc(...)`. No thin pass-through Edge Function — the SPA-direct path was chosen for lower latency without weakening security.
- Project status now advances through user-approved gates: `idea → planning` (this chunk), `planning → ready_to_build` (Chunk 18), etc.
- Anthropic provider mapping for long-form is preserved as the architectural intent. `project_brief` is currently routed to OpenAI as a documented override (see `decisions.md` 2026-05-13). When Anthropic billing is funded, flip `provider` back to `'anthropic'` and remove `responseFormat` in `backend/_shared/ai/config.ts`.
- `generation_logs` insertion is a `// TODO(chunk-27)` in the Edge Function; same pattern as Chunk 09.
