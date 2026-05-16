import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';

import { BookOpen } from './icons';
import { EmptyPanelContent } from './EmptyPanelContent';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { useContextFilesState } from './stubs/useContextFilesState';

type ContextFilesProgressPanelProps = {
  projectId: string;
};

export function ContextFilesProgressPanel({ projectId }: ContextFilesProgressPanelProps) {
  const state = useContextFilesState(projectId);

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.CONTEXT_FILES_TITLE}
      icon={<BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        state.exists || state.presentCount > 0 ? (
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link to={ROUTES.PROJECT_CONTEXT(projectId)}>
              {OVERVIEW_MESSAGES.CONTEXT_FILES_OPEN_LINK}
            </Link>
          </Button>
        ) : null
      }
    >
      {state.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : null}

      {state.isError ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {OVERVIEW_MESSAGES.CONTEXT_FILES_ERROR_BODY}
          </p>
          <Button type="button" variant="outline" onClick={state.retry}>
            {OVERVIEW_MESSAGES.PANEL_RETRY}
          </Button>
        </div>
      ) : null}

      {!state.isLoading && !state.isError && state.presentCount > 0 ? (
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            {OVERVIEW_MESSAGES.CONTEXT_FILES_APPROVAL_PROGRESS(
              state.approvedCount,
              state.total,
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {state.allApproved
              ? OVERVIEW_MESSAGES.CONTEXT_FILES_ALL_APPROVED_BODY
              : OVERVIEW_MESSAGES.CONTEXT_FILES_REVIEW_BODY}
          </p>
        </div>
      ) : null}

      {!state.isLoading && !state.isError && state.presentCount === 0 ? (
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.CONTEXT_FILES_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.CONTEXT_FILES_EMPTY_BODY}
          cta={{
            label: OVERVIEW_MESSAGES.CONTEXT_FILES_EMPTY_CTA,
            to: ROUTES.PROJECT_CONTEXT(projectId),
          }}
        />
      ) : null}
    </PanelCard>
  );
}
