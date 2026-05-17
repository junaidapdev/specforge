import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { CHUNKS_MESSAGES } from '../messages';
import type { ChunkRow } from '../useChunks';
import { ChunkCard } from './ChunkCard';

type ChunkColumnProps = {
  projectId: string;
  status: ChunkStatus;
  chunks: ChunkRow[];
  prdFeatures: Map<string, string>;
  chunksByRef: Map<string, ChunkRow>;
  onStatusChange: (chunk: ChunkRow, status: ChunkStatus) => void;
};

export function ChunkColumn({
  projectId,
  status,
  chunks,
  prdFeatures,
  chunksByRef,
  onStatusChange,
}: ChunkColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { type: 'column', status },
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-[24rem] flex-col gap-3 rounded-lg border bg-muted/20 p-4 transition-colors',
        isOver && 'bg-muted/50',
      )}
    >
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            {CHUNKS_MESSAGES.COLUMN_LABELS[status]}
          </h2>
          <Badge variant="outline">{chunks.length}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {CHUNKS_MESSAGES.COLUMN_DESCRIPTIONS[status]}
        </p>
      </header>

      <SortableContext items={chunks.map((chunk) => chunk.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3">
          {chunks.length > 0 ? (
            chunks.map((chunk) => (
              <ChunkCard
                key={chunk.id}
                projectId={projectId}
                chunk={chunk}
                prdFeatures={prdFeatures}
                chunksByRef={chunksByRef}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <EmptyColumn status={status} />
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function EmptyColumn({ status }: { status: ChunkStatus }) {
  const message = {
    backlog: CHUNKS_MESSAGES.EMPTY_COLUMN_BACKLOG,
    in_progress: CHUNKS_MESSAGES.EMPTY_COLUMN_IN_PROGRESS,
    done: CHUNKS_MESSAGES.EMPTY_COLUMN_DONE,
    blocked: CHUNKS_MESSAGES.EMPTY_COLUMN_BLOCKED,
  }[status];

  return (
    <div className="flex flex-1 items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
