import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';

import { EmptyPanelContent } from './EmptyPanelContent';
import { KanbanSquare } from './icons';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { useChunksState } from './stubs/useChunksState';

type ChunksProgressPanelProps = {
  projectId: string;
};

export function ChunksProgressPanel({ projectId }: ChunksProgressPanelProps) {
  const { data } = useChunksState(projectId);

  if (data.isLoading) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
        icon={<KanbanSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-10" />
            </div>
          ))}
        </div>
      </PanelCard>
    );
  }

  if (data.isError) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
        icon={<KanbanSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {OVERVIEW_MESSAGES.CHUNKS_ERROR_BODY}
          </p>
          <Button type="button" variant="outline" onClick={data.retry}>
            {OVERVIEW_MESSAGES.PANEL_RETRY}
          </Button>
        </div>
      </PanelCard>
    );
  }

  if (!data.exists) {
    return (
      <PanelCard
        title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
        icon={<KanbanSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      >
        <EmptyPanelContent
          title={OVERVIEW_MESSAGES.CHUNKS_EMPTY_TITLE}
          body={OVERVIEW_MESSAGES.CHUNKS_EMPTY_BODY}
        />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
      icon={<KanbanSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      action={
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link to={ROUTES.PROJECT_CHUNKS(projectId)}>
            {OVERVIEW_MESSAGES.CHUNKS_OPEN_LINK}
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ChunkStat label={OVERVIEW_MESSAGES.CHUNKS_TOTAL_LABEL} value={data.total} />
        <ChunkStat label={OVERVIEW_MESSAGES.CHUNKS_DONE_LABEL} value={data.completed} />
        <ChunkStat label={OVERVIEW_MESSAGES.CHUNKS_IN_PROGRESS_LABEL} value={data.inProgress} />
        <ChunkStat label={OVERVIEW_MESSAGES.CHUNKS_OPEN_LABEL} value={data.open} />
      </div>
    </PanelCard>
  );
}

type ChunkStatProps = {
  label: string;
  value: number;
};

function ChunkStat({ label, value }: ChunkStatProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
