import { z } from 'zod';

const ArchitectureEntityIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const ArchitectureDecisionStatusSchema = z.enum([
  'proposed',
  'accepted',
  'superseded',
  'rejected',
]);
export type ArchitectureDecisionStatus = z.infer<typeof ArchitectureDecisionStatusSchema>;

export const ArchitectureDecisionSchema = z.object({
  id: ArchitectureEntityIdSchema,
  title: z.string().min(2).max(200),
  context: z.string().min(10).max(2000),
  decision: z.string().min(10).max(2000),
  consequences: z.string().min(10).max(2000),
  status: ArchitectureDecisionStatusSchema,
});
export type ArchitectureDecision = z.infer<typeof ArchitectureDecisionSchema>;

export const ArchitectureComponentSchema = z.object({
  id: ArchitectureEntityIdSchema,
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(1500),
  responsibilities: z.array(z.string().min(3).max(500)).min(1).max(15),
});
export type ArchitectureComponent = z.infer<typeof ArchitectureComponentSchema>;

export const ArchitectureExternalServiceSchema = z.object({
  id: ArchitectureEntityIdSchema,
  name: z.string().min(2).max(200),
  purpose: z.string().min(5).max(1000),
  notes: z.string().min(0).max(1000).optional(),
});
export type ArchitectureExternalService = z.infer<typeof ArchitectureExternalServiceSchema>;

export const ArchitectureContentSchema = z.object({
  stack_overview: z.string().min(20).max(3000),
  system_diagram_text: z.string().min(20).max(5000),
  components: z.array(ArchitectureComponentSchema).min(1).max(40),
  data_model: z.string().min(20).max(5000),
  external_services: z.array(ArchitectureExternalServiceSchema).max(20),
  auth_and_security: z.string().min(20).max(3000),
  hosting_and_deployment: z.string().min(20).max(3000),
  decisions: z.array(ArchitectureDecisionSchema).max(50),
  open_questions: z.array(z.string().min(3).max(500)).max(15),
});
export type ArchitectureContent = z.infer<typeof ArchitectureContentSchema>;

export const ArchitectureModelOutputSchema = z.object({
  content_json: ArchitectureContentSchema,
  content_markdown: z.string().min(100).max(50000),
});
export type ArchitectureModelOutput = z.infer<typeof ArchitectureModelOutputSchema>;

export const GenerateArchitectureInputSchema = z.object({
  projectId: z.string().uuid(),
});
export type GenerateArchitectureInput = z.infer<typeof GenerateArchitectureInputSchema>;

export const ArchitectureSectionKeySchema = z.enum([
  'stack_overview',
  'system_diagram_text',
  'components',
  'data_model',
  'external_services',
  'auth_and_security',
  'hosting_and_deployment',
  'decisions',
  'open_questions',
]);
export type ArchitectureSectionKey = z.infer<typeof ArchitectureSectionKeySchema>;

export const RegenerateArchitectureSectionInputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('full_section'),
    projectId: z.string().uuid(),
    sectionKey: ArchitectureSectionKeySchema,
  }).strict(),
  z.object({
    mode: z.literal('single_decision'),
    projectId: z.string().uuid(),
    decisionId: ArchitectureEntityIdSchema,
  }).strict(),
]);
export type RegenerateArchitectureSectionInput = z.infer<
  typeof RegenerateArchitectureSectionInputSchema
>;

export const RegenerateArchitectureSectionOutputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('stack_overview'),
    value: ArchitectureContentSchema.shape.stack_overview,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('system_diagram_text'),
    value: ArchitectureContentSchema.shape.system_diagram_text,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('components'),
    value: ArchitectureContentSchema.shape.components,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('data_model'),
    value: ArchitectureContentSchema.shape.data_model,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('external_services'),
    value: ArchitectureContentSchema.shape.external_services,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('auth_and_security'),
    value: ArchitectureContentSchema.shape.auth_and_security,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('hosting_and_deployment'),
    value: ArchitectureContentSchema.shape.hosting_and_deployment,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('decisions'),
    value: ArchitectureContentSchema.shape.decisions,
  }).strict(),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('open_questions'),
    value: ArchitectureContentSchema.shape.open_questions,
  }).strict(),
  z.object({
    mode: z.literal('single_decision'),
    decisionId: ArchitectureEntityIdSchema,
    value: ArchitectureDecisionSchema,
  }).strict(),
]);
export type RegenerateArchitectureSectionOutput = z.infer<
  typeof RegenerateArchitectureSectionOutputSchema
>;

export const SaveArchitectureContentInputSchema = z.object({
  projectId: z.string().uuid(),
  contentJson: ArchitectureContentSchema,
});
export type SaveArchitectureContentInput = z.infer<typeof SaveArchitectureContentInputSchema>;
