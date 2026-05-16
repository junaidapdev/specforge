import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';
import { ROUTES } from '@/constants/routes';
import type { ArchitectureDecisionStatus } from '@shared/schemas/architecture';

import { EmptyPanelContent } from './EmptyPanelContent';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { ScrollText } from './icons';
import { useDecisionsState } from './stubs/useDecisionsState';

type RecentDecisionsPanelProps = {
  projectId: string;
};

export function RecentDecisionsPanel({ projectId }: RecentDecisionsPanelProps) {
  const { data, isLoading, isError, retry } = useDecisionsState(projectId);
  const hasDecisions = data.recent.length > 0;

  function getStatusVariant(
    status: ArchitectureDecisionStatus,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'accepted') {
      return 'default';
    }

    if (status === 'proposed') {
      return 'secondary';
    }

    if (status === 'rejected') {
      return 'destructive';
    }

    return 'outline';
  }

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.DECISIONS_TITLE}
      icon={<ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link to={`${ROUTES.PROJECT_ARCHITECTURE(projectId)}#decisions`}>
            {OVERVIEW_MESSAGES.DECISIONS_OPEN_ALL_LINK}
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}

      {isError ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {OVERVIEW_MESSAGES.DECISIONS_ERROR_BODY}
          </p>
          <Button type="button" variant="outline" onClick={retry}>
            {OVERVIEW_MESSAGES.PANEL_RETRY}
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && hasDecisions ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {OVERVIEW_MESSAGES.DECISIONS_RECENT_LABEL}
          </p>
          <ul className="space-y-3">
            {data.recent.map((decision) => (
              <li key={decision.id} className="space-y-1 rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{decision.title}</p>
                  <Badge variant={getStatusVariant(decision.status)} className="shrink-0">
                    {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[decision.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!isLoading && !isError && !hasDecisions ? (
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.DECISIONS_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.DECISIONS_EMPTY_BODY}
        />
      ) : null}
    </PanelCard>
  );
}
