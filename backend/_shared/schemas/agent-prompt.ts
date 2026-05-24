import { z } from 'zod';

export const TargetAgentSchema = z.enum(['claude_code', 'cursor', 'generic']);
export type TargetAgent = z.infer<typeof TargetAgentSchema>;

export const GenerateAgentPromptInputSchema = z.object({
  chunkId: z.string().uuid(),
  targetAgent: TargetAgentSchema,
}).strict();
export type GenerateAgentPromptInput = z.infer<typeof GenerateAgentPromptInputSchema>;

export const AgentPromptModelOutputSchema = z.object({
  role_intro: z.string().min(50).max(3000),
  how_to_work: z.string().min(50).max(3000),
  philosophy: z.string().min(50).max(2000),
  agent_specific_notes: z.string().min(0).max(2000),
}).strict();
export type AgentPromptModelOutput = z.infer<typeof AgentPromptModelOutputSchema>;
