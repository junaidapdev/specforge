import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import { formatRelativeTime } from '@/lib/relative-time';
import type { Project } from '@/types/project';

import { OVERVIEW_MESSAGES } from './messages';

type ProjectSummaryPanelProps = {
  project: Project;
};

export function ProjectSummaryPanel({ project }: ProjectSummaryPanelProps) {
  return (
    <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {OVERVIEW_MESSAGES.PAGE_TITLE}
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold text-foreground">
              {project.name}
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {project.description ?? OVERVIEW_MESSAGES.SUMMARY_NO_DESCRIPTION}
          </p>
          <p className="text-sm text-muted-foreground">{OVERVIEW_MESSAGES.PAGE_SUBTITLE}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <ProjectStatusBadge status={project.status} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:items-end lg:gap-1">
            <span>
              {OVERVIEW_MESSAGES.SUMMARY_LAST_UPDATED_PREFIX}{' '}
              {formatRelativeTime(project.updated_at)}
            </span>
            <span>
              {OVERVIEW_MESSAGES.SUMMARY_CREATED_PREFIX}{' '}
              {formatRelativeTime(project.created_at)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
