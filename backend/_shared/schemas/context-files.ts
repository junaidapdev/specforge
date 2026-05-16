import { z } from 'zod';

export const CONTEXT_FILE_TYPES = [
  'project_overview',
  'code_standards',
  'ai_workflow_rules',
  'ui_context',
  'agents_md',
  'claude_md',
  'progress_tracker',
] as const;

export const ContextFileTypeSchema = z.enum(CONTEXT_FILE_TYPES);
export type ContextFileType = z.infer<typeof ContextFileTypeSchema>;

export const ContextFilesModelOutputSchema = z.object({
  project_overview: z.string().min(100).max(20000),
  code_standards: z.string().min(100).max(30000),
  ai_workflow_rules: z.string().min(100).max(20000),
  ui_context: z.string().min(100).max(20000),
  agents_md: z.string().min(100).max(20000),
  claude_md: z.string().min(100).max(20000),
  progress_tracker: z.string().min(100).max(20000),
}).strict();
export type ContextFilesModelOutput = z.infer<typeof ContextFilesModelOutputSchema>;

export const GenerateContextFilesInputSchema = z.object({
  projectId: z.string().uuid(),
}).strict();
export type GenerateContextFilesInput = z.infer<typeof GenerateContextFilesInputSchema>;

export const RegenerateContextDocInputSchema = z.object({
  projectId: z.string().uuid(),
  type: ContextFileTypeSchema,
  userInstruction: z.string().min(0).max(1000).optional(),
}).strict();
export type RegenerateContextDocInput = z.infer<typeof RegenerateContextDocInputSchema>;

export const RegenerateContextDocOutputSchema = z.object({
  type: ContextFileTypeSchema,
  content: z.string().min(100).max(30000),
}).strict();
export type RegenerateContextDocOutput = z.infer<typeof RegenerateContextDocOutputSchema>;
