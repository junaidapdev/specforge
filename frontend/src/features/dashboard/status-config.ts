import type { ProjectStatus } from '@/types/project';

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'idea',
  'planning',
  'ready_to_build',
  'building',
  'paused',
  'completed',
] as const;

// New projects start at `idea`. Later chunks advance status as planning docs,
// chunks, and build progress land.
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    dotClass: string;
  }
> = {
  idea: { label: 'Idea', variant: 'outline', dotClass: 'bg-slate-400' },
  planning: { label: 'Planning', variant: 'secondary', dotClass: 'bg-blue-500' },
  ready_to_build: { label: 'Ready to build', variant: 'secondary', dotClass: 'bg-cyan-500' },
  building: { label: 'Building', variant: 'default', dotClass: 'bg-amber-500' },
  paused: { label: 'Paused', variant: 'outline', dotClass: 'bg-zinc-400' },
  completed: { label: 'Completed', variant: 'secondary', dotClass: 'bg-green-600' },
};
