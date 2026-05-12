# Chunk 07 — Dashboard

## Goal

Replace the post-auth dashboard placeholder with a real project list. The dashboard reads the signed-in user's projects directly from Supabase (RLS-enforced), renders them as cards inside the existing `<AppShell>`, links each card into the project workspace, and handles every required UI state. It is the first feature page that consumes user-owned data.

## Acceptance Criteria

### Data
- [x] The dashboard fetches `public.projects` for the authenticated user via the JWT-scoped Supabase client.
- [x] No service role usage and no Edge Function — Row Level Security is the authorization boundary.
- [x] Results are validated with a Zod schema at the network boundary; schema mismatches throw a typed error and surface as the error state.
- [x] Projects are ordered by `updated_at` descending so the most recently active project is first.
- [x] The query has a 30-second `staleTime` and does not refetch on window focus.
- [x] React Query cache is cleared on sign-out so the next user does not see the previous user's projects.

### Required States
- [x] **Loading** — skeleton header plus six skeleton project cards. No blank screen.
- [x] **Empty** — folder icon, "No projects yet" headline, helper copy, primary CTA pointing to `/projects/new`.
- [x] **Error** — alert icon, friendly copy from the dashboard message constants, retry button that re-runs the query.
- [x] **Success** — header (title, subtitle, "+ New Project" button) plus a responsive 1/2/3-column grid of `ProjectCard`s.

### Project Card
- [x] Card is a clickable link to `/projects/:id/overview` with a visible focus ring.
- [x] Shows project name (truncated single line), optional description (clamped to two lines), and a status badge (color dot plus label).
- [x] Three stat slots — Chunks, Complete, Open issues — render as em-dash placeholders with tooltips that reference the chunk that will activate each stat (Chunks → 18, Complete → 22, Open issues → 23).
- [x] Footer shows a relative "Updated <time>" string using a shared formatter.

### Routing & Shell
- [x] `/dashboard` renders inside `<AppShell>` behind `<RequireAuth>`.
- [x] The "+ New Project" button and the empty-state CTA both link to `ROUTES.PROJECT_NEW` (target route is built in Chunk 08).
- [x] Project cards link to `ROUTES.PROJECT_OVERVIEW(id)` (target page is built in Chunk 11/12; the link itself is correct now).

### Standards
- [x] No `console.*` outside `lib/logger.ts`.
- [x] No `any` in new code; Supabase results parsed through Zod before reaching React.
- [x] All copy lives in `features/dashboard/messages.ts`; no inline user-facing strings in components.
- [x] Status configuration (label, badge variant, dot color) lives in `features/dashboard/status-config.ts` keyed by `ProjectStatus`.
- [x] Validation passes: `npm run typecheck`, `npm run lint`, `npm run build`. (See decisions log for why npm and not pnpm for this chunk.)

## Files Touched

Added:
- `frontend/src/features/dashboard/DashboardPage.tsx`
- `frontend/src/features/dashboard/DashboardSkeleton.tsx`
- `frontend/src/features/dashboard/EmptyDashboard.tsx`
- `frontend/src/features/dashboard/DashboardError.tsx`
- `frontend/src/features/dashboard/ProjectCard.tsx`
- `frontend/src/features/dashboard/ProjectStatusBadge.tsx`
- `frontend/src/features/dashboard/status-config.ts`
- `frontend/src/features/dashboard/messages.ts`
- `frontend/src/features/dashboard/useProjects.ts`
- `frontend/src/types/project.ts`
- `frontend/src/lib/relative-time.ts`
- `frontend/src/components/ui/badge.tsx`

Modified:
- `frontend/src/App.tsx` — swap `DashboardPlaceholder` for `DashboardPage`.
- `frontend/src/features/auth/AuthProvider.tsx` — call `queryClient.clear()` after `signOut`.

Removed:
- `frontend/src/pages/DashboardPlaceholder.tsx`

## Out of Scope

- **Project creation** — `+ New Project` button links to a route that does not yet exist. Chunk 08.
- **Project workspace pages** — overview/brief/PRD/etc. linked from each card render via the existing `ProjectModePlaceholder` shell stub. Chunk 11 onward.
- **Real chunk count, completion %, and open-issue count on cards** — placeholders today; activated in Chunks 18, 22, and 23 respectively.
- **Sorting, filtering, search, or pagination** — single-user, list-then-grid is sufficient for MVP.
- **Optimistic updates or background polling** — not needed; `staleTime` plus explicit refetch is enough.
- **Deletion or archival from the dashboard** — handled in project settings, not the list view.
- **Bundle-size optimization** — the production bundle exceeds Vite's 500 kB warning threshold. Logged as a known issue; defer to a perf chunk.

## Notes for Future Agents

- The dashboard reads Supabase directly. Do not add an Edge Function unless a future chunk needs server-only logic (e.g., aggregating counts that require service-role escalation — and even then prefer a SQL view).
- The query key is `['projects']`. Mutations elsewhere (Chunk 08+) must invalidate it so the dashboard reflects new, updated, or deleted projects.
- `staleTime: 30000` was chosen to avoid noisy refetches during active use; revisit if the dashboard ever shows real-time data.
- The placeholder stat tooltips reference chunk numbers (18 / 22 / 23). When those chunks land, replace the placeholders with real data and remove the tooltip references.
