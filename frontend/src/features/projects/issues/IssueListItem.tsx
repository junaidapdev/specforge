import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/relative-time';
import type { IssueRow } from '@shared/schemas/issue';

import { IssueSeverityBadge } from './IssueSeverityBadge';
import { IssueStatusBadge } from './IssueStatusBadge';

type IssueListItemProps = {
  issue: IssueRow;
  projectId: string;
};

export function IssueListItem({ issue, projectId }: IssueListItemProps) {
  return (
    <Link
      to={ROUTES.PROJECT_ISSUE(projectId, issue.id)}
      className="flex flex-col gap-3 rounded-md border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-start"
    >
      <div className="flex shrink-0 flex-wrap gap-2">
        <IssueStatusBadge status={issue.status} />
        <IssueSeverityBadge severity={issue.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-medium text-foreground">{issue.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <span>{formatRelativeTime(issue.updated_at)}</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </div>
    </Link>
  );
}
