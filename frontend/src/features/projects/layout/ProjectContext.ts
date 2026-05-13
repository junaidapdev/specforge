import { createContext } from 'react';

import type { Project } from '@/types/project';

export type ProjectContextValue = {
  project: Project;
  /** Refetches the project after mutations. */
  refetchProject: () => void;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);
