import { z } from 'zod';

export const PROJECT_TYPE_VALUES = [
  'side_project',
  'company',
  'client',
  'saas',
  'other',
] as const;

export const PROJECT_AGENT_VALUES = [
  'claude_code',
  'cursor',
  'codex',
  'windsurf',
  'other',
] as const;

export const PROJECT_STATUS_VALUES = [
  'idea',
  'planning',
  'ready_to_build',
  'building',
  'paused',
  'completed',
] as const;

function optionalTrimmedString(maxLength: number, message: string) {
  return z.union([
    z.literal('').transform(() => undefined),
    z.string().trim().max(maxLength, message).optional(),
  ]);
}

export const ProjectCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required.')
    .max(200, 'Project name is too long (max 200 characters).'),
  description: optionalTrimmedString(
    2000,
    'Description is too long (max 2000 characters).',
  ),
  project_type: z.enum(PROJECT_TYPE_VALUES).optional(),
  preferred_stack: optionalTrimmedString(500, 'Preferred stack is too long.'),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
