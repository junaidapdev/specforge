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

## 2026-05-10 — Frontend Toolchain Baseline

**Decision:** The frontend scaffold targets Node.js `>=20` and uses the npm-resolved current majors for the Vite stack: React 19, Vite 8, TypeScript 6, ESLint 9, and React Router 7.
**Reason:** Chunk 01 asked for latest stable packages with major versions pinned, and Node `>=20` is a conservative baseline for the current Vite/TypeScript ecosystem.
**Alternatives considered:** Pinning older React 18, Vite 5/6/7, TypeScript 5, or Node 18 for wider compatibility.
**Reversibility:** Hard

## 2026-05-10 — Tailwind 3 for shadcn Config Compatibility

**Decision:** The frontend uses Tailwind CSS 3.4.x for the initial scaffold.
**Reason:** Chunk 01 requires `tailwind.config.ts`, PostCSS, and shadcn-style CSS variable setup, which align cleanly with Tailwind 3.
**Alternatives considered:** Tailwind CSS 4, which has different defaults and would require deviating from the requested config shape.
**Reversibility:** Easy

## 2026-05-10 — shadcn Button Dependencies

**Decision:** The frontend installs `class-variance-authority` and `@radix-ui/react-slot` for the shadcn `Button` component.
**Reason:** These are the standard runtime dependencies required by the shadcn button implementation, and the product owner approved installing them for Chunk 01.
**Alternatives considered:** Hand-writing a simpler button without shadcn variants, or skipping the button primitive until a later chunk.
**Reversibility:** Easy

## 2026-05-10 — AI Provider Mapping

**Decision:** Short structured generations (`idea_clarification`, `agent_prompt_generation`, `issue_to_spec`) use OpenAI with `gpt-4o-mini`; long-form document and knowledge generations use Anthropic with the current Sonnet model. The mapping lives in `backend/_shared/ai/config.ts`.
**Reason:** OpenAI is the default for short structured generations where speed and cost matter; Anthropic is the default for long-form documents where depth and coherence matter. The config map is the single point of change for swapping providers or models.
**Alternatives considered:** OpenAI-only, Anthropic-only, direct provider selection inside each feature, or storing provider choices across multiple feature files.
**Reversibility:** Easy

## 2026-05-10 — Anthropic Sonnet Model Substitution

**Decision:** The backend uses `claude-sonnet-4-6` instead of the prompt's `claude-sonnet-4-5` default.
**Reason:** The prompt allowed using the current Sonnet equivalent, and Anthropic's current model documentation lists Claude Sonnet 4.6 as the latest Sonnet model identifier.
**Alternatives considered:** Keeping `claude-sonnet-4-5` exactly as listed in the table.
**Reversibility:** Easy

## 2026-05-10 — Official Provider SDKs on Deno

**Decision:** The backend imports the official OpenAI and Anthropic TypeScript SDKs through Deno npm imports pinned in `backend/import_map.json`.
**Reason:** Deno 2 supports npm imports, and `deno check` verified the SDK imports and provider wrappers. This keeps provider code aligned with official SDK surfaces.
**Alternatives considered:** Direct `fetch` calls to provider HTTP APIs if SDK compatibility failed.
**Reversibility:** Easy

## 2026-05-10 — CORS Allowlist Hardening

**Decision:** Backend CORS defaults to `*` in development, but production rejects `ALLOWED_ORIGINS=*` at env validation time.
**Reason:** The MVP needs frictionless local development, while production must require explicit SPA origins before deployment.
**Alternatives considered:** Always requiring explicit origins, or allowing `*` in production and relying on auth only.
**Reversibility:** Easy

## 2026-05-10 — Frontend Component Export Convention

**Decision:** Frontend app components use named exports matching the existing scaffold, such as `export function HomePage()`, while shadcn/ui generated primitives keep their generated export style.
**Reason:** Chunk 01 scaffolded `App` and `HomePage` with named exports. Chunk 03 documented the convention that actually exists instead of creating a standards mismatch.
**Alternatives considered:** Requiring default exports for every component file, which would need a separate refactor chunk to update the scaffold.
**Reversibility:** Easy

## 2026-05-10 — UUID Primary Keys and Auth User Mirror

**Decision:** All app tables use UUID primary keys generated by `gen_random_uuid()`, and `public.users.id` mirrors `auth.users.id`.
**Reason:** UUIDs match Supabase Auth IDs, avoid sequential ID exposure, and keep user-owned records easy to relate back to the authenticated user.
**Alternatives considered:** Sequential integer IDs, ULIDs, and separate app-user IDs not tied directly to `auth.users`.
**Reversibility:** Hard

## 2026-05-10 — Hard Delete Only for MVP

**Decision:** The MVP uses hard deletes only. No user-data table has a `deleted_at` soft-delete column.
**Reason:** Hard delete keeps the schema, queries, indexes, and RLS policies simpler while the product validates the core workflow.
**Alternatives considered:** Soft deletes on every user-data table, archive tables, and per-resource recovery flows.
**Reversibility:** Hard

## 2026-05-10 — Cascade Rules for User and Project Deletion

**Decision:** Deleting a project cascades to its documents, chunks, specs, issues, learnings, and generation logs. Deleting an auth user cascades through `public.users` and all owned project data.
**Reason:** Project deletion should remove the complete private project workspace. User deletion is not a normal MVP flow, but when it happens, user-owned data should not be orphaned.
**Alternatives considered:** Restricting deletes when child rows exist, setting project-owned rows to null, or preserving orphaned records for recovery.
**Reversibility:** Hard

## 2026-05-10 — Check Constraints Instead of Postgres Enums

**Decision:** Bounded values in the initial schema use `text` columns with explicit `check` constraints instead of Postgres enum types.
**Reason:** The Chunk 04 table definitions specify `text` columns with `check` constraints, and check constraints are easier to evolve while MVP statuses and generation types are still settling.
**Alternatives considered:** Postgres enum types for status columns and unrestricted `text` without database-level constraints.
**Reversibility:** Easy

## 2026-05-10 — Immutable Generation Logs

**Decision:** `generation_logs` rows have `created_at` but no `updated_at`, no user update policy, and no user delete policy.
**Reason:** Generation logs are usage/audit records. Feature code can insert logs with the user's JWT, but retention and cleanup are system-level concerns.
**Alternatives considered:** Editable logs, user-deletable logs, or deferring the log table until usage logging features are built.
**Reversibility:** Easy

## 2026-05-10 — Email Verification Enforced

**Decision:** Email/password sign-up keeps Supabase's default email verification behavior enabled.
**Reason:** Verified email addresses reduce account confusion and align with the auth model expected by Supabase Auth and RLS-backed user data.
**Alternatives considered:** Disabling email confirmation to speed up local testing.
**Reversibility:** Easy

**Note:** The frontend flow honors this decision, but the current local Supabase config has email confirmations disabled. Aligning local auth config should happen in a backend/config follow-up because Chunk 05 is frontend-only.

## 2026-05-10 — Supabase Session Storage

**Decision:** Frontend sessions use Supabase JS default browser storage in `localStorage`.
**Reason:** This matches the locked architecture and keeps session persistence inside Supabase's supported client behavior.
**Alternatives considered:** Custom cookie storage, memory-only sessions, or a custom auth persistence layer.
**Reversibility:** Hard

## 2026-05-10 — OAuth Callback Route

**Decision:** Google OAuth redirects back to `<origin>/auth/callback`.
**Reason:** A dedicated callback route lets the SPA show an explicit processing state while Supabase JS settles the session before redirecting into the protected app.
**Alternatives considered:** Redirecting directly to `/dashboard` or using `/auth/confirm` for both email and OAuth.
**Reversibility:** Easy

## 2026-05-10 — Friendly Auth Error Mapping

**Decision:** Supabase auth errors are mapped to user-facing messages in the frontend instead of displaying raw provider strings.
**Reason:** Raw auth errors can be inconsistent, overly technical, or expose implementation details. Central mapping keeps copy stable and readable.
**Alternatives considered:** Displaying raw Supabase messages or mapping every possible provider error code individually up front.
**Reversibility:** Easy

## 2026-05-10 — Current shadcn CLI for Auth Primitives

**Decision:** Chunk 05 used `npx shadcn@latest add input label card alert separator` after `npx shadcn-ui@latest` reported that the old package is deprecated.
**Reason:** The current `shadcn` CLI is the maintained path and produced the requested primitives without changing the component architecture.
**Alternatives considered:** Manually writing the primitives or continuing with the deprecated `shadcn-ui` package.
**Reversibility:** Easy

## 2026-05-12 — Sidebar Collapse State in localStorage

**Decision:** The app shell persists the desktop sidebar collapsed/expanded preference in `localStorage` under `specforge.sidebar.collapsed`.
**Reason:** The preference should survive reloads without requiring a database field or user settings feature before Chunk 29.
**Alternatives considered:** Keeping the sidebar state in memory only, storing the preference in Supabase user settings, or always deriving collapsed state from viewport size.
**Reversibility:** Easy

## 2026-05-12 — Mobile Sidebar Uses shadcn Sheet

**Decision:** The mobile navigation drawer uses the shadcn `<Sheet>` primitive.
**Reason:** `Sheet` gives the app a keyboard-accessible drawer with focus management and escape/backdrop dismissal without hand-rolling dialog behavior.
**Alternatives considered:** A custom mobile drawer, keeping the desktop sidebar visible on mobile, or deferring mobile navigation entirely.
**Reversibility:** Easy

## 2026-05-12 — Inert Sidebar Items Until Owning Chunks Land

**Decision:** Future sidebar routes render now as keyboard-focusable inert controls with `aria-disabled="true"` and an "Available in Chunk N" tooltip. Activating a route later means removing its `pendingChunk` field in `nav-config.ts`.
**Reason:** This shows the product roadmap in the chrome while preventing navigation into unfinished features.
**Alternatives considered:** Hiding future routes until each chunk lands, linking to 404 pages, or adding placeholder pages for every future route.
**Reversibility:** Easy

## 2026-05-12 — Error Boundary Logs Message and Stack Only

**Decision:** The React error boundary logs only `error.message` and `error.stack` through the frontend logger.
**Reason:** Full React error objects can carry component details or props; logging only message and stack keeps diagnostics useful without risking sensitive UI state.
**Alternatives considered:** Logging the full error object, logging React component info, or not logging render errors.
**Reversibility:** Easy

## 2026-05-12 — Dev-Only Route Map Build Flag

**Decision:** `/dev/routes` is gated behind the Vite build-time constant `__SPECFORGE_DEV_ROUTES__`, enabled outside production builds.
**Reason:** The route map is useful during development but should not appear in the production bundle. A build-time constant lets Vite remove the page from production output.
**Alternatives considered:** Runtime-checking `IS_PRODUCTION`, which hid the route but still emitted the dev page chunk; shipping the route in production; or skipping the route map.
**Reversibility:** Easy

## 2026-05-12 — pnpm Package Manager and 7-Day Release Age

**Decision:** Frontend JavaScript package management uses `pnpm`, with `minimumReleaseAge: 10080` in the root `pnpm-workspace.yaml`.
**Reason:** `pnpm` supports delaying newly published package versions by minutes; 10080 minutes equals 7 days and reduces the chance of installing a compromised package immediately after publication.
**Alternatives considered:** Continuing with npm, using Yarn, or using pnpm without a minimum package age policy.
**Reversibility:** Easy

## 2026-05-12 — Chunk 07 Restored `node_modules` with `npm install`

**Decision:** Chunk 07's frontend validation runs against a `node_modules` restored by `npm install` from the existing `package-lock.json`. The product owner approved one-time use of npm to unblock `typecheck`, `lint`, and `build` for this chunk.
**Reason:** A prior `pnpm install` attempt failed on the new 7-day `minimumReleaseAge` rule because `react@19.2.6` was 5 days old, and the partial install left `node_modules` missing TypeScript and several other packages. `package-lock.json` already pinned `react@19.2.6` from an earlier npm install made before the pnpm policy took effect, so restoring from the lockfile reintroduces no packages that were not already accepted into the project. The 7-day rule remains in force for future installs.
**Alternatives considered:** Waiting two days for `react@19.2.6` to age past 7 days; pinning `react`/`react-dom` to a mature minor inside Chunk 07; adding a `minimumReleaseAgeExclude` entry for `react` and `react-dom`; running checks against the half-broken `node_modules`.
**Reversibility:** Easy

## 2026-05-12 — pnpm Cutover Deferred to Its Own Chunk

**Decision:** The full pnpm cutover — choosing mature versions for any dependencies that fail the 7-day rule, generating `pnpm-lock.yaml`, removing `frontend/package-lock.json`, and re-running `typecheck`/`lint`/`build` under pnpm — is deferred to a dedicated Chunk 07.5, not bundled into Chunk 07.
**Reason:** Switching package managers and shifting dependency versions is housekeeping orthogonal to the dashboard feature. Bundling them in one commit would muddy the review surface, conflate two unrelated rollback scenarios, and stretch Chunk 07's scope beyond its acceptance criteria. Keeping the cutover separate lets it be reviewed, validated, and reverted on its own terms.
**Alternatives considered:** Folding the pnpm cutover into Chunk 07; deferring the cutover indefinitely; reverting the 7-day rule to allow a normal pnpm install of `react@19.2.6` today.
**Reversibility:** Easy

## 2026-05-12 — pnpm Cutover Completed with Mature Dependency Ranges

**Decision:** Frontend installs now use `pnpm-lock.yaml`; `frontend/package-lock.json` is removed. Fresh packages that failed the 7-day release-age gate were constrained to mature ranges: React/React DOM `>=19.2.5 <19.2.6`, Supabase JS `>=2.105.3 <2.105.4`, Vite `>=8.0.11 <8.0.12`, and TypeScript ESLint parser/plugin `>=8.58.0 <8.58.1`.
**Reason:** The existing dependency ranges selected versions published fewer than 7 days ago, which correctly failed the new pnpm supply-chain policy. Constraining to the latest mature compatible patches keeps the app working while preserving `minimumReleaseAge: 10080`.
**Alternatives considered:** Waiting for the newest versions to age past 7 days, disabling the release-age rule, using broad `minimumReleaseAgeExclude` entries, or keeping npm as a temporary installer.
**Reversibility:** Easy

## 2026-05-12 — Narrow pnpm Metadata Excludes

**Decision:** `minimumReleaseAgeExclude` includes exact internal packages from `@supabase`, `@tanstack`, and `@typescript-eslint` whose registry metadata lacks the `time` field during pnpm resolution.
**Reason:** These excludes are for metadata availability, not freshness bypass. The parent direct dependencies are constrained to mature versions, and `pnpm install`, `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build` pass under the 7-day rule.
**Alternatives considered:** Adding a broad exclude for all scoped packages, keeping npm, or downgrading much further to avoid exact internal dependencies with incomplete metadata.
**Reversibility:** Easy

## 2026-05-12 — New Projects Start at Idea Status

**Decision:** Newly created projects are inserted with `status = 'idea'`.
**Reason:** Chunk 08 captures only basic details. Later chunks advance projects through planning and build states when the brief, documents, chunks, and progress features exist.
**Alternatives considered:** Starting at `planning` immediately, or leaving status to the database default only.
**Reversibility:** Easy

## 2026-05-12 — New Project Flow Persistence Model

**Decision:** The project row is created at step 1. Clarification answers in Chunk 09 stay in component state until the project brief is generated in Chunk 10, when the durable brief is persisted as a `project_documents` row.
**Reason:** This makes a new project resumable as soon as basic details are submitted without storing abandoned clarification drafts in the database.
**Alternatives considered:** Persisting every clarification answer immediately, or delaying project creation until after the brief is generated.
**Reversibility:** Medium

## 2026-05-12 — Shared Schema Alias

**Decision:** The frontend imports shared Zod schemas through the `@shared` alias pointing at `backend/_shared`. Only `@shared/schemas/*` imports are allowed across the frontend/backend boundary.
**Reason:** Shared schemas prevent validation drift, and the alias avoids brittle deep relative paths while preserving the runtime boundary.
**Alternatives considered:** Continuing with relative `../../../backend/...` imports, duplicating schemas in the frontend, or opening the alias to all backend shared code.
**Reversibility:** Easy

## 2026-05-12 — Duplicate Project Names Allowed

**Decision:** Project names are not unique per user in the MVP.
**Reason:** The Chunk 04 schema has no unique constraint on `(user_id, name)`, and allowing duplicates keeps project creation simple. If duplicate names become confusing, a later migration can add uniqueness or a UI disambiguation rule.
**Alternatives considered:** Adding a new migration for `(user_id, name)` uniqueness in Chunk 08, or checking duplicates client-side before insert.
**Reversibility:** Medium

## 2026-05-12 — React Hook Form for Forms

**Decision:** Feature forms use `react-hook-form` with `@hookform/resolvers` and shared Zod schemas.
**Reason:** This is the standard shadcn Form pattern, keeps typed form validation close to the schema, and avoids duplicating validation state management by hand.
**Alternatives considered:** Continuing the hand-rolled state pattern used by the auth scaffold, or adding a larger form framework.
**Reversibility:** Easy

## 2026-05-13 — Idea Clarifier Regenerates Questions Per Visit

**Decision:** Clarifying questions are not cached. Every visit to `/projects/:id/clarify` calls the `generate-clarifying-questions` Edge Function and regenerates questions from stored project basics.
**Reason:** The question list is short and cheap to regenerate. Caching would add database writes and invalidation complexity for marginal MVP value.
**Alternatives considered:** Persisting generated questions in `project_documents`, adding a dedicated clarification table, or storing them in browser storage.
**Reversibility:** Easy

## 2026-05-13 — Clarification Answers Stay Ephemeral

**Decision:** Clarification answers are held in form state and passed to Chunk 10 through `location.state`; raw question/answer pairs are not persisted in Chunk 09.
**Reason:** The generated brief is the durable artifact of value. The Q&A is scaffolding for the brief and follows the Chunk 08 persistence model.
**Alternatives considered:** Persisting every answer immediately, storing abandoned drafts, or delaying project creation until all clarifications are answered.
**Reversibility:** Medium

## 2026-05-13 — Clarifying Question Count and Skip Behavior

**Decision:** The prompt targets 7 questions, while Zod enforces a 5-10 question range. Each question may be skipped by leaving its answer blank, and a skip-ahead link is always available.
**Reason:** Seven questions is enough to improve the brief without making onboarding feel heavy. The 5-10 bound rejects runaway model output. Skipping prevents AI issues or uncertainty from blocking progress.
**Alternatives considered:** A fixed 7-question schema, required answers, or blocking users until AI succeeds.
**Reversibility:** Easy

## 2026-05-13 — AI Failure Handling for Idea Clarifier

**Decision:** The Edge Function does not automatically retry provider or invalid-output failures. It returns HTTP `502` with `AI_PROVIDER_ERROR` or `AI_INVALID_OUTPUT`, and the frontend surfaces a retryable error state.
**Reason:** Provider failures and malformed model JSON are upstream generation failures, so `502` communicates the boundary correctly. Manual retry keeps behavior explicit and avoids duplicate AI spend.
**Alternatives considered:** Retrying inside the Edge Function, returning a fallback static question list, or using HTTP `500` for all AI failures.
**Reversibility:** Easy

## 2026-05-13 — `callEdgeFunction` as Frontend Edge Client

**Decision:** Frontend Edge Function calls go through `frontend/src/lib/edge.ts` and its `callEdgeFunction` helper.
**Reason:** One helper centralizes the `/functions/v1/<name>` URL, auth header, anon key, JSON POST behavior, and standard envelope parsing for later AI features.
**Alternatives considered:** Raw `fetch` calls in each feature hook or a larger generated API client.
**Reversibility:** Easy

## 2026-05-13 — Idea Clarification System Prompt

**Decision:** The `idea_clarification` generation uses OpenAI `gpt-4o-mini` with JSON mode and this system prompt:

```text
You are a senior product engineer helping the user clarify a project idea before a project brief is generated.

Generate exactly between 5 and 10 short, specific clarifying questions. Target 7 questions unless the idea clearly needs fewer or more. Questions should be specific and forward-looking. Avoid yes/no questions. Avoid generic questions like "What is your goal?". Each question should help define scope, users, features, technical constraints, or success criteria.

Return strict JSON matching this TypeScript shape:
{
  "questions": [
    {
      "id": "short_snake_case_id",
      "text": "Question text?",
      "category": "problem | users | scope | features | tech | success_criteria | other",
      "example": "Optional answer example"
    }
  ]
}

Rules:
- Respond with ONLY the JSON object. No preamble, markdown, code fences, or commentary.
- Each id must be stable, unique, lowercase, and under 40 characters.
- Each question text must be 5 to 500 characters.
- Use category only when it fits one of the allowed values.
- Use example only when it helps the user answer concretely.

Example:
{
  "questions": [
    {
      "id": "primary_users",
      "text": "Which specific users should the first version serve, and what situation are they in when they use it?",
      "category": "users",
      "example": "Solo developers planning weekend SaaS projects."
    },
    {
      "id": "first_success_signal",
      "text": "What would make the first shipped version feel successful within the first week?",
      "category": "success_criteria"
    }
  ]
}
```

**Reason:** The prompt states the role, output contract, count bound, quality bar, and JSON-only behavior. OpenAI JSON mode provides an additional guard before Zod validation.
**Alternatives considered:** Keeping the stub prompt, using a longer multi-example prompt, or parsing prose-wrapped JSON on the server.
**Reversibility:** Easy
