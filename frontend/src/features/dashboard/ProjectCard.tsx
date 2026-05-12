import { Link } from 'react-router-dom';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/relative-time';
import type { Project } from '@/types/project';

import { DASHBOARD_MESSAGES } from './messages';
import { ProjectStatusBadge } from './ProjectStatusBadge';

type ProjectCardProps = {
  project: Project;
};

type PlaceholderStatProps = {
  label: string;
  pendingChunk: number;
};

function PlaceholderStat({ label, pendingChunk }: PlaceholderStatProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-sm font-semibold text-foreground">
            &mdash;
          </span>
        </TooltipTrigger>
        <TooltipContent>{DASHBOARD_MESSAGES.CARD_PLACEHOLDER_TOOLTIP(pendingChunk)}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      to={ROUTES.PROJECT_OVERVIEW(project.id)}
    >
      <Card className="flex h-full flex-col transition-colors group-hover:border-primary/50">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h2 className="truncate text-lg font-semibold text-card-foreground">
                {project.name}
              </h2>
              {project.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              ) : null}
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <PlaceholderStat
            label={DASHBOARD_MESSAGES.CARD_CHUNK_COUNT_LABEL}
            pendingChunk={18}
          />
          <PlaceholderStat label={DASHBOARD_MESSAGES.CARD_COMPLETION_LABEL} pendingChunk={22} />
          <PlaceholderStat
            label={DASHBOARD_MESSAGES.CARD_OPEN_ISSUES_LABEL}
            pendingChunk={23}
          />
        </CardContent>
        <CardFooter className="mt-auto border-t pt-4 text-sm text-muted-foreground">
          {DASHBOARD_MESSAGES.CARD_LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(project.updated_at)}
        </CardFooter>
      </Card>
    </Link>
  );
}
