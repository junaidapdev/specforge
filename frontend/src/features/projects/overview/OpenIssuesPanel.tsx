import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/relative-time';

import { EmptyPanelContent } from './EmptyPanelContent';
import { AlertOctagon } from './icons';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { useIssuesState } from './stubs/useIssuesState';

type OpenIssuesPanelProps = {
  projectId: string;
};

export function OpenIssuesPanel({ projectId }: OpenIssuesPanelProps) {
  const { data } = useIssuesState(projectId);
  const hasIssues = data.openCount > 0;

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.ISSUES_TITLE}
      icon={<AlertOctagon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        hasIssues ? (
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link to={ROUTES.PROJECT_ISSUES(projectId)}>
              {OVERVIEW_MESSAGES.ISSUES_OPEN_ALL_LINK}
            </Link>
          </Button>
        ) : null
      }
    >
      {hasIssues ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {OVERVIEW_MESSAGES.ISSUES_RECENT_LABEL}
          </p>
          <ul className="space-y-3">
            {data.recent.map((issue) => (
              <li key={issue.id} className="space-y-1 rounded-md border p-3">
                <p className="text-sm font-medium text-foreground">{issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(issue.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.ISSUES_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.ISSUES_EMPTY_BODY}
        />
      )}
    </PanelCard>
  );
}
