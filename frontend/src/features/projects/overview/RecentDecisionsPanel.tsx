import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/relative-time';

import { EmptyPanelContent } from './EmptyPanelContent';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { ScrollText } from './icons';
import { useDecisionsState } from './stubs/useDecisionsState';

type RecentDecisionsPanelProps = {
  projectId: string;
};

export function RecentDecisionsPanel({ projectId }: RecentDecisionsPanelProps) {
  const { data } = useDecisionsState(projectId);
  const hasDecisions = data.recent.length > 0;

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.DECISIONS_TITLE}
      icon={<ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link to={ROUTES.PROJECT_ARCHITECTURE(projectId)}>
            {OVERVIEW_MESSAGES.DECISIONS_OPEN_ALL_LINK}
          </Link>
        </Button>
      }
    >
      {hasDecisions ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {OVERVIEW_MESSAGES.DECISIONS_RECENT_LABEL}
          </p>
          <ul className="space-y-3">
            {data.recent.map((decision) => (
              <li key={decision.id} className="space-y-1 rounded-md border p-3">
                <p className="text-sm font-medium text-foreground">{decision.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(decision.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.DECISIONS_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.DECISIONS_EMPTY_BODY}
        />
      )}
    </PanelCard>
  );
}
