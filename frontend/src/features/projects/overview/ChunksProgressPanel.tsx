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

  // TODO(chunk-18+): real chunk progress UI.
  // Layout sketch:
  // - Stats: Total, Completed, In progress, Open.
  // - Progress bar showing completed / total.
  // - "Open board" link to ROUTES.PROJECT_CHUNKS(projectId).
  return null;
}
