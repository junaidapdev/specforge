import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { PrdContentSchema } from '@shared/schemas/prd';

export const PrdRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('prd'),
  title: z.string(),
  content: z.string(),
  content_json: PrdContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PrdRow = z.infer<typeof PrdRowSchema>;

export const prdQueryKey = (projectId: string) => ['prd', projectId] as const;

export function useExistingPrd(projectId: string) {
  return useQuery<PrdRow | null>({
    queryKey: prdQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'prd')
        .maybeSingle();

      if (error) {
        logger.error('prd_fetch_failed', { code: error.code, message: error.message });
        throw new Error('PRD_FETCH_FAILED');
      }

      if (!data) {
        return null;
      }

      const parsed = PrdRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_invalid_shape', { issues: parsed.error.issues });
        throw new Error('PRD_INVALID_SHAPE');
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
  });
}
