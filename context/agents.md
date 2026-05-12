# SpecForge Agent Startup Protocol

You are working on SpecForge. This file is the canonical startup protocol for AI coding agents. The root `AGENTS.md` is the bootstrap file and should point agents here for the ordered context list.

## Read in This Order Before Coding

1. `AGENTS.md` (root)
2. `context/agents.md`
3. `CLAUDE.md` (root)
4. `context/01-project-overview.md`
5. `context/02-architecture.md`
6. `context/03-code-standards.md`
7. `context/04-ai-workflow-rules.md`
8. `context/05-ui-context.md`
9. `context/06-progress-tracker.md`
10. `context/decisions.md`
11. The active feature spec in `feature-specs/`

## Core Rules

- Implement only the active feature spec.
- Do not exceed scope.
- Do not refactor unrelated files.
- Do not invent architecture.
- Do not introduce dependencies without justification + decision log entry.
- Use `pnpm` for frontend package work and preserve `minimumReleaseAge: 10080`.
- Update `context/06-progress-tracker.md` after completion.
- Append to `context/decisions.md` for any non-trivial decision.

## Standards Summary

- TypeScript strict, no `any`.
- Frontend package management uses `pnpm`, not `npm` or `yarn`.
- pnpm must enforce `minimumReleaseAge: 10080` in `pnpm-workspace.yaml`.
- No `console.*` outside `logger.ts`.
- Zod validation at every boundary.
- Standard `{ ok, data | error }` envelope on every Edge Function.
- HTTP status and error codes from constants, never inline.
- RLS or server-side auth on every user-data path.
- Loading, empty, error states on every page.

## When in Doubt

Stop and ask. A wrong assumption committed is more expensive than a five-minute clarification.
