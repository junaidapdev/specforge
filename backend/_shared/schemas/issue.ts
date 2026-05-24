import { z } from 'zod';

export const IssueSeveritySchema = z.enum(['low', 'medium', 'high']);
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

export const IssueStatusSchema = z.enum(['open', 'resolved']);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

export const IssueRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  related_chunk_id: z.string().uuid().nullable(),
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(8000),
  severity: IssueSeveritySchema,
  status: IssueStatusSchema,
  generated_prompt: z.string().nullable(),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().nullable(),
});
export type IssueRow = z.infer<typeof IssueRowSchema>;

export const CreateIssueInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(20).max(8000),
  severity: IssueSeveritySchema,
  relatedChunkId: z.string().uuid().nullable().optional(),
}).strict();
export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;

export const UpdateIssueInputSchema = CreateIssueInputSchema.omit({ projectId: true }).extend({
  issueId: z.string().uuid(),
}).strict();
export type UpdateIssueInput = z.infer<typeof UpdateIssueInputSchema>;

export const GenerateIssuePromptInputSchema = z.object({
  issueId: z.string().uuid(),
}).strict();
export type GenerateIssuePromptInput = z.infer<typeof GenerateIssuePromptInputSchema>;

export const IssuePromptModelOutputSchema = z.object({
  role_intro: z.string().min(50).max(2000),
  what_to_fix: z.string().min(50).max(3000),
  acceptance: z.string().min(20).max(2000),
}).strict();
export type IssuePromptModelOutput = z.infer<typeof IssuePromptModelOutputSchema>;

export const IssuePromptResultSchema = z.object({
  id: z.string().uuid(),
  generated_prompt: z.string().min(1),
  version: z.number().int().min(2),
  updated_at: z.string(),
});
export type IssuePromptResult = z.infer<typeof IssuePromptResultSchema>;
