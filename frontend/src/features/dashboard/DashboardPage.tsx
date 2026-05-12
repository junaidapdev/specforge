import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { Project } from '@/types/project';

import { DashboardError } from './DashboardError';
import { EmptyDashboard } from './EmptyDashboard';
import { DASHBOARD_MESSAGES } from './messages';
import { ProjectCard } from './ProjectCard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { useProjects } from './useProjects';

function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {DASHBOARD_MESSAGES.PAGE_TITLE}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{DASHBOARD_MESSAGES.PAGE_SUBTITLE}</p>
      </div>
      <Button asChild>
        <Link to={ROUTES.PROJECT_NEW}>{DASHBOARD_MESSAGES.NEW_PROJECT_BUTTON}</Link>
      </Button>
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { data, isError, isPending, refetch } = useProjects();

  if (isPending) {
    return <DashboardSkeleton />;
  }

  const projects = data ?? [];

  return (
    <div className="space-y-8">
      <DashboardHeader />
      {isError ? (
        <DashboardError
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}
      {!isError && projects.length === 0 ? <EmptyDashboard /> : null}
      {!isError && projects.length > 0 ? <ProjectGrid projects={projects} /> : null}
    </div>
  );
}
