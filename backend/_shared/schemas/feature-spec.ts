import { z } from 'zod';

/** A feature spec's structured content: seven Markdown-string sections. */
export const FeatureSpecContentSchema = z.object({
  goal: z.string().min(20).max(8000),
  scope: z.string().min(20).max(8000),
  out_of_scope: z.string().min(20).max(8000),
  technical_requirements: z.string().min(20).max(8000),
  ui_requirements: z.string().min(20).max(8000),
  security_requirements: z.string().min(20).max(8000),
  acceptance_criteria: z.string().min(20).max(8000),
}).strict();
export type FeatureSpecContent = z.infer<typeof FeatureSpecContentSchema>;

export const FeatureSpecModelOutputSchema = z.object({
  content_json: FeatureSpecContentSchema,
  content_markdown: z.string().min(100).max(60000).optional(),
}).strict();
export type FeatureSpecModelOutput = z.infer<typeof FeatureSpecModelOutputSchema>;

export const GenerateFeatureSpecInputSchema = z.object({
  chunkId: z.string().uuid(),
}).strict();
export type GenerateFeatureSpecInput = z.infer<typeof GenerateFeatureSpecInputSchema>;

export const FeatureSpecSectionKeySchema = z.enum([
  'goal',
  'scope',
  'out_of_scope',
  'technical_requirements',
  'ui_requirements',
  'security_requirements',
  'acceptance_criteria',
]);
export type FeatureSpecSectionKey = z.infer<typeof FeatureSpecSectionKeySchema>;

export const RegenerateFeatureSpecSectionInputSchema = z.object({
  chunkId: z.string().uuid(),
  sectionKey: FeatureSpecSectionKeySchema,
  userInstruction: z.string().min(0).max(1000).optional(),
}).strict();
export type RegenerateFeatureSpecSectionInput = z.infer<
  typeof RegenerateFeatureSpecSectionInputSchema
>;

export const RegenerateFeatureSpecSectionOutputSchema = z.object({
  sectionKey: FeatureSpecSectionKeySchema,
  content: z.string().min(20).max(8000),
}).strict();
export type RegenerateFeatureSpecSectionOutput = z.infer<
  typeof RegenerateFeatureSpecSectionOutputSchema
>;

export const SaveFeatureSpecContentInputSchema = z.object({
  chunkId: z.string().uuid(),
  contentJson: FeatureSpecContentSchema,
}).strict();
export type SaveFeatureSpecContentInput = z.infer<typeof SaveFeatureSpecContentInputSchema>;
