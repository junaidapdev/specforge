import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { z } from 'zod';

import { ProjectBreadcrumb } from './ProjectBreadcrumb';
import { ProjectContext } from './ProjectContext';
import { ProjectLayoutError } from './ProjectLayoutError';
import { ProjectLayoutPending } from './ProjectLayoutPending';
import { ProjectNotFound } from './ProjectNotFound';
import { useProjectQuery } from './useProjectQuery';

const ProjectIdSchema = z.string().uuid();

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const parsedId = useMemo(() => {
    const result = ProjectIdSchema.safeParse(id);
    return result.success ? result.data : null;
  }, [id]);
  const query = useProjectQuery(parsedId);

  if (!parsedId) {
    return <ProjectNotFound />;
  }

  if (query.isPending) {
    return <ProjectLayoutPending />;
  }

  if (query.isError) {
    return (
      <ProjectLayoutError
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (!query.data) {
    return <ProjectNotFound />;
  }

  return (
    <ProjectContext.Provider
      value={{
        project: query.data,
        refetchProject: () => {
          void query.refetch();
        },
      }}
    >
      <ProjectBreadcrumb />
      <Outlet />
    </ProjectContext.Provider>
  );
}
