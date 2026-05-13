import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

const ProjectRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(['idea', 'planning', 'ready_to_build', 'building', 'paused', 'completed']),
  project_type: z.enum(['side_project', 'company', 'client', 'saas', 'other']).nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.enum(['claude_code', 'cursor', 'codex', 'windsurf', 'other']).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const projectQueryKey = (id: string) => ['project', id] as const;

export function useProjectQuery(id: string | null) {
  return useQuery<Project | null>({
    queryKey: projectQueryKey(id ?? 'invalid-project-id'),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        logger.error('project_fetch_failed', { code: error.code });
        throw new Error('PROJECT_FETCH_FAILED');
      }

      if (!data) {
        return null;
      }

      const parsed = ProjectRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('project_invalid_shape', { issues: parsed.error.issues });
        throw new Error('PROJECT_INVALID_SHAPE');
      }

      return parsed.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
