import { z } from 'zod';

export const ArchitectureDecisionStatusSchema = z.enum([
  'proposed',
  'accepted',
  'superseded',
  'rejected',
]);
export type ArchitectureDecisionStatus = z.infer<typeof ArchitectureDecisionStatusSchema>;

export const ArchitectureDecisionSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(2).max(200),
  context: z.string().min(10).max(2000),
  decision: z.string().min(10).max(2000),
  consequences: z.string().min(10).max(2000),
  status: ArchitectureDecisionStatusSchema,
});
export type ArchitectureDecision = z.infer<typeof ArchitectureDecisionSchema>;

export const ArchitectureComponentSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(1500),
  responsibilities: z.array(z.string().min(3).max(500)).min(1).max(15),
});
export type ArchitectureComponent = z.infer<typeof ArchitectureComponentSchema>;

export const ArchitectureExternalServiceSchema = z.object({
  id: z.string().min(1).max(40),
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
