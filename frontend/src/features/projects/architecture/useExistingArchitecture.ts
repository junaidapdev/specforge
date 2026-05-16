import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { ArchitectureContentSchema } from '@shared/schemas/architecture';

export const ArchitectureRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('architecture'),
  title: z.string(),
  content: z.string(),
  content_json: ArchitectureContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ArchitectureRow = z.infer<typeof ArchitectureRowSchema>;

export const architectureQueryKey = (projectId: string) =>
  ['architecture', projectId] as const;

export function useExistingArchitecture(projectId: string) {
  return useQuery<ArchitectureRow | null>({
    queryKey: architectureQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'architecture')
        .maybeSingle();

      if (error) {
        logger.error('architecture_fetch_failed', { code: error.code, message: error.message });
        throw new Error('ARCHITECTURE_FETCH_FAILED');
      }

      if (!data) {
        return null;
      }

      const parsed = ArchitectureRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_invalid_shape', { issues: parsed.error.issues });
        throw new Error('ARCHITECTURE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
  });
}
