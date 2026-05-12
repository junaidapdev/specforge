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

const ProjectListSchema = z.array(ProjectRowSchema);

export const projectsQueryKey = ['projects'] as const;

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('projects_fetch_failed', {
          code: error.code,
          message: error.message,
        });
        throw new Error('PROJECTS_FETCH_FAILED');
      }

      // Validate every network boundary so schema drift is caught before rendering.
      const parsed = ProjectListSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('projects_invalid_shape', { issues: parsed.error.issues });
        throw new Error('PROJECTS_INVALID_SHAPE');
      }

      return parsed.data;
    },
    // Dashboard data changes through explicit project actions, so avoid noisy focus refetches.
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
}
