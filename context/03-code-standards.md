# SpecForge Code Standards

## TypeScript Standards

- Strict mode is non-negotiable. The frontend settings live in `frontend/tsconfig.json` and `frontend/tsconfig.node.json`; backend checking runs through `backend/deno.json`.
- `any` is forbidden. Use `unknown` and narrow with type guards, discriminated unions, or Zod parsing.
- Frontend enforcement: `@typescript-eslint/no-explicit-any: error` in `frontend/eslint.config.js`.
- Backend enforcement: Deno lint recommended rules include `no-explicit-any`; `backend/deno.json` also includes `no-console`.
- Prefer `type` over `interface` for object shapes unless extending an existing type, implementing class contracts, or matching an SDK shape that is already interface-based. The current backend scaffold uses interfaces for exported SDK/domain contracts in `backend/_shared/ai/types.ts`; keep that pattern until a refactor chunk changes it.
- Use `as const` for literal-type lookup tables such as errors, routes, statuses, and provider mappings.
- Avoid non-null assertions (`!`). Narrow with conditionals, explicit errors, or Zod instead.
- Avoid `@ts-ignore` and `@ts-expect-error`. If unavoidable, the comment must include a one-line reason and the chunk summary must call it out.
- Use discriminated unions for state with mutually exclusive shapes.

```ts
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };
```

## React / Frontend Component Standards

- Functional components only.
- Component files expose named component exports matching the file name, such as `export function HomePage()`. Chunk 03's prompt requested default exports, but Chunk 01 scaffolded `App` and `HomePage` as named exports; this document follows the scaffolded convention. If default exports are preferred later, make that a dedicated refactor chunk and decision log entry.
- shadcn/ui generated primitives may keep the export style produced by the shadcn generator.
- Co-locate component-specific types in the component file unless reused.
- Hook names start with `use`.
- Shared hooks live in `frontend/src/hooks/`; feature-specific hooks live next to the feature that owns them.
- Avoid prop drilling more than two levels. Use auth context, feature context, or React Query server state where that better matches the data.
- Side effects belong in `useEffect`, not in render.
- Do not fetch directly in `useEffect`; use TanStack Query for server state.
- Forms use Zod schemas. Shared frontend/backend schemas live in `backend/_shared/schemas/` and are imported into the frontend through the `@shared` alias.
- Every page or major component must explicitly handle loading, empty, error, and success/default states. None of these states is the default by accident; each must be designed.
- Internal imports from `frontend/src/` use the `@/` alias.

## Backend / Edge Function Standards

- Every Edge Function is a single `index.ts` under `backend/functions/<name>/`.
- Every Edge Function handles CORS preflight first with `handleCorsPreflight(req)`.
- Every Edge Function validates input with Zod at the request boundary.
- Every private operation authenticates via `verifyAuth` or `requireAuth` from `backend/_shared/auth/`.
- Every Edge Function returns the standard envelope using `ok`, `created`, or `fail` from `backend/_shared/http/response.ts`.
- Every HTTP status code comes from `backend/_shared/constants/http.ts`. No magic status numbers in function code.
- Every error code comes from `backend/_shared/constants/errors.ts`. No magic error-code strings in function code.
- Every Edge Function wraps its handler in a top-level `try/catch`. Caught errors map to standard envelopes.
- Logs go only through `backend/_shared/logger.ts`. Never call `console.*` outside the logger.
- Never log sensitive data, including tokens, passwords, env values, API keys, full request bodies, full user objects, or full AI responses.
- Database queries from Edge Functions use the user's JWT-scoped Supabase client, not the service role key, for user-data queries.
- The service role key is never used for user-data queries. It is reserved for explicitly system-level operations such as logging or cleanup.
- Any service-role use must include an inline comment explaining why it is system-level and safe.
- Multi-row writes, such as create project plus initial documents, use Postgres transactions or `supabase.rpc` to a stored procedure. No partial writes on failure.
- **AI feature error handling.** Edge Functions that call `generate(...)` must handle `AiProviderError` and `AiInvalidOutputError` distinctly, returning HTTP `502` with the appropriate error code. The frontend must surface AI failures as a retryable error state, never a silent fallback.

## REST Conventions

- Resource paths are plural nouns: `/projects`, `/projects/:id/chunks`.
- Supabase Edge Function URLs are flat, so function names map conceptually to REST routes. For example, a future `projects-list` function corresponds to `GET /projects`.
- Document the conceptual REST mapping in each Edge Function's top-level comment or README section when the function is added.
- `GET` reads.
- `POST` creates.
- `PATCH` performs partial updates.
- `PUT` performs replacements and should be avoided unless a full replacement is genuinely needed.
- `DELETE` deletes.
- Status codes match intent: `200`, `201`, and reserved `204` for success; `400`, `401`, `403`, `404`, `422`, `429`, and `500` for failures.
- The current response helper supports enveloped `200` and `201` responses. Use those unless a future spec explicitly requires a bodyless `204`.
- The standard envelope is the same shape across all body-bearing endpoints, regardless of method.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

## Validation Standards

- Library: Zod. No alternatives.
- Shared schemas live in `backend/_shared/schemas/<resource>.ts`.
- Schemas are exported with both their Zod object and inferred type.

```ts
export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
```

- Frontend imports shared schemas via the `@shared` alias.

```ts
import { ProjectCreateSchema } from '@shared/schemas/project';
```

- Cross-folder schema imports are the only sanctioned cross-folder imports. Runtime code,
  helpers, types not derived from a Zod schema, and any secret-bearing backend code must
  not be imported across the `frontend/` and `backend/` boundary.
- Backend validates at the function boundary.
- Validation failure returns HTTP `422` with `VALIDATION_FAILED`.
- When validation helpers are extended, include a safe list of `ZodError.issues` in the response payload without exposing secrets or internal stack traces.
- Frontend validates on submit, reuses the same schema, and displays inline errors.
- AI output is treated as untrusted until parsed as JSON and validated with Zod.

## Constants & Configuration

- All frontend env access goes through `frontend/src/config/env.ts`.
- All backend env access goes through `backend/_shared/env.ts`, except `backend/_shared/logger.ts`, which reads `ENVIRONMENT` directly so logging can stay tiny and independent.
- No other file reads `import.meta.env` or `Deno.env.get`.
- Recurring strings and numbers live in dedicated constants files.
- Frontend route paths live in `frontend/src/constants/routes.ts`.
- Frontend user-facing errors live in `frontend/src/constants/errors.ts`.
- Backend error codes and messages live in `backend/_shared/constants/errors.ts`.
- Backend HTTP status codes live in `backend/_shared/constants/http.ts`.
- API keys, database URLs, JWT secrets, provider keys, and service role keys are never committed.

## Error Handling

- Errors thrown by Edge Functions are caught in the top-level `try/catch` and converted to the standard envelope.
- Frontend server-call errors surface through TanStack Query error state.
- Frontend non-React-Query async work uses component-level `try/catch`.
- A global React error boundary catches render-time errors and shows a friendly fallback when implemented in Chunk 06.
- User-facing error messages come from `frontend/src/constants/errors.ts`.
- Backend codes, such as `VALIDATION_FAILED`, map to user-friendly messages on the frontend.
- Never display raw error objects, stack traces, provider errors, or backend codes to the user.
- Do not catch and swallow errors. Either handle the error intentionally or rethrow/map it to a standard envelope.

## Logging

- `console.log`, `console.debug`, `console.info`, `console.warn`, and `console.error` are forbidden everywhere except logger files.
- Frontend enforcement: `no-console: error` in `frontend/eslint.config.js`, with an override only for `frontend/src/lib/logger.ts`.
- Backend enforcement: `no-console` included in `backend/deno.json`, with `// deno-lint-ignore-file no-console` only in `backend/_shared/logger.ts`.
- `logger.warn` and `logger.error` always fire.
- `logger.debug` and `logger.info` no-op in production.
- Never log tokens, passwords, full user objects, full request bodies, full AI responses, env values, API keys, or provider secrets.
- Log shape: first argument is a stable action string for grep; second argument is safe structured context when useful.

```ts
logger.info('project_created', { projectId });
```

## Folder Structure

Frontend source layout:

```text
frontend/src/
  components/        (shadcn/ui primitives + composed components)
  features/          (one folder per feature: dashboard, prd, architecture, chunks, etc.)
  lib/               (logger, supabase client, utilities)
  config/            (env.ts - typed env access)
  constants/         (errors.ts, routes.ts, etc.)
  hooks/             (shared hooks)
  types/             (frontend-specific types only)
  pages/             (route-level components)
  main.tsx
  App.tsx
```

Backend source layout:

```text
backend/
  _shared/
    ai/
    auth/
    constants/
    http/
    schemas/
    env.ts
    logger.ts
  functions/
    <function-name>/
      index.ts
  supabase/
    migrations/
    config.toml
    seed.sql
  deno.json
  import_map.json
```

Any deviation from the architecture in `context/02-architecture.md` must be documented in `context/decisions.md` before implementation.

## Naming Conventions

- Files: `kebab-case` for non-component files, such as `project-list.ts`.
- React component files: `PascalCase`, such as `ProjectList.tsx`.
- Components: `PascalCase`.
- Hooks: `useCamelCase`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Functions and variables: `camelCase`.
- Types and interfaces: `PascalCase`. No `I` prefix.
- Edge Function names: `kebab-case`, verb-noun where it helps, such as `generate-prd` or `chunks-list`.
- Database tables: `snake_case`, plural nouns, such as `project_documents`.

## Dependency Standards

- New packages require product-owner approval and a justification documented in `context/decisions.md`.
- Frontend JavaScript package management uses `pnpm`.
- Do not use `npm` or `yarn` for frontend installs, dependency additions, or script execution unless the product owner explicitly approves it.
- Keep `minimumReleaseAge: 10080` in the root `pnpm-workspace.yaml`. This is 7 days in minutes and applies to direct and transitive dependencies.
- Do not add `minimumReleaseAgeExclude` entries unless the product owner approves the exception and the reason is recorded in `context/decisions.md`.
- Prefer the standard library and small focused packages over large frameworks.
- Pin major versions and update deliberately, not opportunistically.
- Verify Deno compatibility for backend packages. Node-only packages cannot be used in Supabase Edge Functions.
- Backend package imports are pinned through `backend/import_map.json` and checked with `deno task check`.
- Frontend package changes must pass `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build`.

## Security Standards

- Secrets are never committed.
- Service role key is never used for user-data queries.
- Every user-data API path requires authentication and authorization, enforced server-side, not in the UI.
- The frontend may hide inaccessible UI, but authorization is enforced by RLS or Edge Function checks.
- Sensitive data is never logged.
- AI output is untrusted until Zod-validated.
- Every user-owned database row is scoped to the authenticated user through RLS policies defined in migrations.

## Code Review Items (From Developer Notes - Standing Rules)

1. ✅ Scratch `.md` files (`CrossFix.md`, `DeploymentFix.md`, etc.) - gitignored at root in `.gitignore`.
2. ✅ `.cursor/` folder - gitignored at root in `.gitignore`.
3. ✅ Modular interfaces - types are co-located with their domain or in `_shared/schemas/`; no god-files.
4. ✅ Env vars via constants files - `frontend/src/config/env.ts` and `backend/_shared/env.ts` only, except the backend logger's direct `ENVIRONMENT` read.
5. ⚠️ Backend and frontend in separate repos - deviation. Single repo, two folders. Documented in `context/decisions.md`.
6. ✅ Frontend in React.js - Vite + React + TypeScript in `frontend/`.
7. ✅ No `console.log` in production - tiny logger; ESLint and Deno lint enforce no direct `console.*` outside loggers.
8. ✅ Common API response structure - `{ ok, data | error }` envelope in `backend/_shared/http/response.ts`.
9. ✅ Error messages from constants file - `backend/_shared/constants/errors.ts` and `frontend/src/constants/errors.ts`.
10. ✅ Database transactions - required for multi-row writes; no multi-row writes exist yet, and this is documented per feature when introduced.
11. ✅ Consistent HTTP status codes - `backend/_shared/constants/http.ts`, no magic numbers.
12. ✅ No `any` - frontend ESLint and backend Deno lint reject explicit `any`.
13. ✅ REST conventions - documented above.
14. ✅ Single validation library - Zod, with shared schemas in `backend/_shared/schemas/`.
15. ✅ Constants in dedicated files - routes, errors, HTTP statuses, and provider mappings live in dedicated files.

## Known Standards Gaps

- Frontend component export style: this document follows current named exports. The prompt requested default exports, so changing that later requires a deliberate refactor.
- CORS methods: `backend/_shared/http/cors.ts` currently allows `GET`, `POST`, and `OPTIONS`. Add `PATCH`, `PUT`, or `DELETE` to the helper in the same future chunk that introduces those methods.
- Validation issue details: `fail(...)` currently returns only `{ code, message }`. Add safe validation details when the first user-facing validation-heavy endpoint needs them.
- Global error boundary, auth guard, dark-mode toggle, skeletons, and toasts are standards now but are implemented in later UI chunks.
