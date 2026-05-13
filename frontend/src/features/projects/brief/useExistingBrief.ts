import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { ProjectBriefContentSchema } from '@shared/schemas/brief';

export const BriefRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('project_brief'),
  title: z.string(),
  content: z.string(),
  content_json: ProjectBriefContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BriefRow = z.infer<typeof BriefRowSchema>;

export const briefQueryKey = (projectId: string) => ['brief', projectId] as const;

export function useExistingBrief(projectId: string) {
  return useQuery<BriefRow | null>({
    queryKey: briefQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'project_brief')
        .maybeSingle();

      if (error) {
        logger.error('brief_fetch_failed', { code: error.code, message: error.message });
        throw new Error('BRIEF_FETCH_FAILED');
      }

      if (!data) {
        return null;
      }

      const parsed = BriefRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('brief_invalid_shape', { issues: parsed.error.issues });
        throw new Error('BRIEF_INVALID_SHAPE');
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
  });
}
