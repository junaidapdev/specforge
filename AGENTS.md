# AGENTS.md

This file contains the universal instructions for AI coding agents working on SpecForge.

SpecForge is a spec-driven project planning workspace for AI-assisted builders. It turns raw ideas into PRDs, architecture docs, context files, shippable chunks, feature specs, coding-agent prompts, progress trackers, issue prompts, project memory, and exportable markdown packs.

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

## Core Rule

Implement one feature unit at a time.

Do not go beyond the active feature spec.

## Product Summary

SpecForge helps users:
- Clarify project ideas
- Generate PRDs
- Generate architecture docs
- Generate context files
- Break projects into shippable chunks
- Generate feature specs
- Generate Claude Code/Cursor-ready prompts
- Track build progress
- Convert bugs into corrective prompts
- Extract engineering lessons from transcripts/notes
- Export full markdown project packs

## MVP Scope

The MVP includes:
- Auth
- Dashboard
- Project creation
- Idea clarifier
- PRD generator/editor
- Architecture generator/editor
- Context files generator
- Shippable chunk generator
- Chunk board
- Feature spec generator
- Agent prompt generator
- Progress tracker
- Issue-to-spec converter
- Knowledge/transcript ingestion
- Markdown/ZIP export
- Usage logging
- Basic rate limits
- Vercel deployment

## Out of Scope for MVP

Do not build unless explicitly requested:
- Team collaboration
- Payments
- GitHub integration
- Cursor extension
- Browser extension
- Real-time multiplayer
- Template marketplace
- Admin dashboard
- Enterprise roles
- Full RAG system
- Direct AI code execution inside the app

## Implementation Rules

- Use the active feature spec as source of truth.
- Work only on the requested feature.
- Do not refactor unrelated areas.
- Preserve existing behavior.
- Do not add unapproved dependencies.
- Keep server/client boundaries clear.
- Validate all external input.
- Protect all private data server-side.
- Update the progress tracker after completion.

## Security Rules

- Every private route must require authentication.
- Every user-owned resource must be scoped to the authenticated user.
- API routes must validate input.
- API routes must enforce authorization.
- Never expose secrets to the client.
- Never commit API keys, tokens, database URLs, or private user data.
- AI outputs must be treated as untrusted until validated.
- Generated exports must only include the current user's project data.

## Completion Rules

A feature is not complete until:

- The feature spec acceptance criteria are satisfied.
- Relevant loading, empty, and error states are handled.
- Security requirements are implemented.
- TypeScript/build errors are resolved.
- Progress tracker is updated.
- The agent summarizes files changed and follow-up risks.

## If Unclear

If the spec conflicts with architecture or code standards:
1. Stop.
2. Explain the conflict.
3. Ask for a decision.
4. Do not invent a hidden architecture change.

## Git Workflow Requirements

Before making changes:

1. Confirm the current branch with `git branch --show-current`.
2. If not already on the correct chunk branch, create or switch to:
   `chunk/XX-short-description`
3. Run `git status --short`.
4. If there are unrelated uncommitted changes, stop and ask before touching them.
5. Implement only this chunk.

After making changes:

1. Run relevant checks for this chunk.
2. Update `context/06-progress-tracker.md`.
3. Run `git status --short`.
4. Stage only files changed for this chunk.
5. Commit with a clear message:
   `Chunk XX: short description`
6. Do not merge into `develop` or `main` unless explicitly instructed.
7. Summarize:
   - branch name
   - commit hash
   - files changed
   - checks run
   - risks or follow-ups

Additional rules:

- Work on one chunk branch at a time.
- Branches use the format `chunk/XX-short-description`.
- Never commit unrelated changes.
- Do not merge into `develop` or `main` unless explicitly requested.
