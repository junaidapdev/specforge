import { z } from 'zod';

const ChunkRefSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const ChunkStatusSchema = z.enum(['backlog', 'in_progress', 'done', 'blocked']);
export type ChunkStatus = z.infer<typeof ChunkStatusSchema>;

export const ChunkEffortSchema = z.enum(['xs', 's', 'm', 'l', 'xl']);
export type ChunkEffort = z.infer<typeof ChunkEffortSchema>;

export const GeneratedChunkSchema = z.object({
  ref: ChunkRefSchema,
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(2000),
  included_features: z.array(z.string().min(1).max(40)).min(0).max(15),
  dependencies: z.array(ChunkRefSchema).min(0).max(10),
  estimated_effort: ChunkEffortSchema,
}).strict();
export type GeneratedChunk = z.infer<typeof GeneratedChunkSchema>;

export const ChunkModelOutputSchema = z.object({
  chunks: z.array(GeneratedChunkSchema).min(1).max(30),
}).strict();
export type ChunkModelOutput = z.infer<typeof ChunkModelOutputSchema>;

export const GenerateChunksInputSchema = z.object({
  projectId: z.string().uuid(),
}).strict();
export type GenerateChunksInput = z.infer<typeof GenerateChunksInputSchema>;
