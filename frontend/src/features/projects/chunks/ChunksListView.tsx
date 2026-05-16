import { CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

import { ChunkListItem } from './ChunkListItem';
import { ChunksPageActions } from './ChunksPageActions';
import { CHUNKS_MESSAGES } from './messages';
import type { ChunkRow } from './useChunks';

type ChunksListViewProps = {
  projectId: string;
  chunks: ChunkRow[];
  statusAdvanced: boolean;
};

export function ChunksListView({
  projectId,
  chunks,
  statusAdvanced,
}: ChunksListViewProps) {
  const prdQuery = useExistingPrd(projectId);
  const prdFeatures = useMemo(
    () =>
      new Map(
        prdQuery.data?.content_json.features.map((feature) => [feature.id, feature.name]) ?? [],
      ),
    [prdQuery.data],
  );
  const chunksByRef = useMemo(
    () => new Map(chunks.map((chunk) => [chunk.ref, chunk])),
    [chunks],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{CHUNKS_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{CHUNKS_MESSAGES.PAGE_SUBTITLE}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {CHUNKS_MESSAGES.COUNT_LABEL(chunks.length)}
          </p>
        </div>
        <ChunksPageActions projectId={projectId} />
      </header>

      {statusAdvanced ? (
        <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{CHUNKS_MESSAGES.STATUS_ADVANCED_BANNER}</AlertTitle>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {chunks.map((chunk) => (
          <ChunkListItem
            key={chunk.id}
            chunk={chunk}
            prdFeatures={prdFeatures}
            chunksByRef={chunksByRef}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{CHUNKS_MESSAGES.BOARD_VIEW_PLACEHOLDER}</p>
    </div>
  );
}
