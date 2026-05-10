# SpecForge AI Workflow Rules

## Required Reading Order

Before implementing anything, read these files in order:

1. `CLAUDE.md`
2. `context/01-project-overview.md`
3. `context/02-architecture.md`
4. `context/03-code-standards.md`
5. `context/04-ai-workflow-rules.md`
6. `context/05-ui-context.md`
7. `context/06-progress-tracker.md`
8. The active feature spec in `feature-specs/`

Do not implement until you understand the active spec and the existing project state.

## One Feature at a Time

- Implement only the active feature spec.
- Do not refactor unrelated areas.
- Do not invent new architecture.
- Do not add features that were not requested.
- Do not silently change patterns established in earlier chunks.
- Preserve existing behavior unless the active spec explicitly changes it.

## Stop and Ask

Stop and ask the product owner instead of proceeding when:

- The feature spec conflicts with `context/02-architecture.md`.
- The feature spec conflicts with `context/03-code-standards.md`.
- An external dependency, npm package, model identifier, or API is missing or deprecated.
- A security implication is not addressed in the spec.
- A required input, route, env var, model name, schema, table, or constant is undefined.
- A change would require touching unrelated files or refactoring outside the active chunk.

## Update the Progress Tracker

After completing a chunk, update `context/06-progress-tracker.md`:

- Move the chunk to Completed.
- Set Next Up to the next chunk only.
- Note any open risk or follow-up.
- Keep Blocked and Known Issues current.

## Update the Decision Log

Append to `context/decisions.md` before the chunk is considered complete when any of these happen:

- Substituting one library, model, or version for another.
- Falling back from an SDK to direct HTTP calls.
- Choosing one of multiple acceptable approaches when the spec is genuinely ambiguous.
- Deferring a piece of acceptance criteria to a later chunk, with reason and replacement chunk number.
- Deviating from a code review recommendation or established project convention.

## Self-Review Before Marking Complete

Before claiming a chunk is done, verify:

- All acceptance criteria check.
- Build passes, such as `npm run build` or `deno task check`.
- Lint passes, such as `npm run lint` or `deno task lint`.
- TypeScript passes, such as `npm run typecheck`.
- No `console.*` outside logger files.
- No `any` in committed code.
- No secrets in committed code.
- Loading, empty, error, and success/default states exist for any new UI.
- RLS or server-side authorization is in place for any new user-data path.
- Progress tracker is updated.
- Final summary lists files changed, checks run, risks, and follow-ups.

## Anti-patterns Forbidden

- Vibe coding: building from vague requests.
- Scope creep: adding features adjacent to the spec.
- Silent refactor: rewriting unrelated files.
- Magic numbers or magic strings inline.
- Catch-and-swallow error handling.
- Disabling lint rules to make code pass.
- `any` to make TypeScript shut up.
- `console.log` instead of the logger.
- Service role key for user-data queries.
- Trusting AI output without Zod-validating it.

## Git Workflow

- Work on one chunk branch at a time.
- Branches use the format `chunk/XX-short-description`.
- Never commit unrelated changes.
- Before editing, check the current branch and worktree status.
- If unrelated changes exist, stop and ask.
- After completing a chunk, update `context/06-progress-tracker.md`.
- Stage only files changed for the active chunk.
- Commit with the format `Chunk XX: short description`.
- Do not merge into `develop` or `main` unless explicitly requested.
