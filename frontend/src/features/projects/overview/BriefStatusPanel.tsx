import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/relative-time';

import { CheckCircle2, Clock, FileText } from './icons';
import { EmptyPanelContent } from './EmptyPanelContent';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';

type BriefStatusPanelProps = {
  projectId: string;
};

export function BriefStatusPanel({ projectId }: BriefStatusPanelProps) {
  const brief = useExistingBrief(projectId);

  if (brief.isPending) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.BRIEF_TITLE}
        icon={<FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </PanelCard>
    );
  }

  if (brief.isError) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.BRIEF_TITLE}
        icon={<FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{OVERVIEW_MESSAGES.BRIEF_ERROR_BODY}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void brief.refetch();
            }}
          >
            {OVERVIEW_MESSAGES.PANEL_RETRY}
          </Button>
        </div>
      </PanelCard>
    );
  }

  if (!brief.data) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.BRIEF_TITLE}
        icon={<FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.BRIEF_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.BRIEF_EMPTY_BODY}
          cta={{
            label: OVERVIEW_MESSAGES.BRIEF_EMPTY_CTA,
            to: ROUTES.PROJECT_BRIEF(projectId),
          }}
        />
      </PanelCard>
    );
  }

  const banner = brief.data.is_final
    ? OVERVIEW_MESSAGES.BRIEF_APPROVED_BANNER
    : OVERVIEW_MESSAGES.BRIEF_DRAFT_BANNER;
  const StatusIcon = brief.data.is_final ? CheckCircle2 : Clock;
  const bannerClassName = brief.data.is_final
    ? 'border-green-600/30 bg-green-600/10 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
    : 'border-amber-600/30 bg-amber-600/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400';

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.BRIEF_TITLE}
      icon={<FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link to={ROUTES.PROJECT_BRIEF(projectId)}>{OVERVIEW_MESSAGES.BRIEF_OPEN_LINK}</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
            bannerClassName,
          )}
        >
          <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{banner}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {OVERVIEW_MESSAGES.BRIEF_LAST_UPDATED_PREFIX} {formatRelativeTime(brief.data.updated_at)}
        </p>
      </div>
    </PanelCard>
  );
}
