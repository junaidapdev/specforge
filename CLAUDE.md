# CLAUDE.md

You are working on SpecForge.

SpecForge is a project planning and memory workspace for AI-assisted software builders. It helps users move from raw ideas to PRDs, architecture, context files, shippable feature specs, coding-agent prompts, build tracking, issue prompts, knowledge insights, and exportable markdown packs.

## How To Work

Before coding:
1. Read `AGENTS.md`.
2. Read all files in `/context`.
3. Read the active feature spec in `/feature-specs`.
4. Check `context/06-progress-tracker.md`.
5. Implement only the active feature.

After coding:
1. Run relevant checks.
2. Update `context/06-progress-tracker.md`.
3. Summarize files changed.
4. Mention risks or follow-ups.

## Do Not Vibe Code

Do not build from vague requests.

Do not add features that were not requested.

Do not refactor unrelated areas.

Do not silently change architecture.

Do not skip progress tracker updates.

## Project Stack

Default stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk
- Postgres
- Prisma
- AI API integration
- Vercel

If the architecture file changes this, follow the architecture file.

## Product Priorities

Prioritize:
1. Reliable project memory
2. High-quality generated docs/specs
3. Clean handoff to Claude Code/Cursor
4. Progress tracking
5. Security and user data isolation
6. Simple, fast MVP
7. Exportable markdown

Avoid:
1. Overbuilding
2. Generic project management features
3. Complex collaboration before MVP validation
4. Fancy UI over core workflow
5. Untracked decisions

## Security Rules

- Never expose secrets.
- Never log private tokens.
- Never allow cross-user project access.
- Validate all API input.
- Scope all database queries by authenticated user.
- Treat AI-generated content as untrusted.
- Keep exports user-scoped.

## UI Rules

- Use a clean, serious SaaS interface.
- Prefer clarity over decoration.
- Use shadcn/ui components.
- Use consistent spacing, typography, and states.
- Every major page needs loading, empty, and error states.
- The app should feel like a professional builder workspace, not a toy.

## MVP Reminder

MVP means:
- One user
- Private projects
- AI planning documents
- Chunks
- Feature specs
- Agent prompts
- Progress tracking
- Issues
- Knowledge ingestion
- Export

No teams, payments, marketplace, or GitHub integration until later.
