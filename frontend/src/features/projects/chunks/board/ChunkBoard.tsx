import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { ChunksPageActions } from '../ChunksPageActions';
import { CHUNKS_MESSAGES } from '../messages';
import type { ChunkRow } from '../useChunks';
import { ChunkCardCompact } from './ChunkCardCompact';
import { ChunkColumn } from './ChunkColumn';
import { useMoveChunk } from './useMoveChunk';

const CHUNK_STATUSES: ChunkStatus[] = ['backlog', 'in_progress', 'done', 'blocked'];

type ChunkBoardProps = {
  projectId: string;
  chunks: ChunkRow[];
  statusAdvanced: boolean;
};

export function ChunkBoard({ projectId, chunks, statusAdvanced }: ChunkBoardProps) {
  const move = useMoveChunk(projectId);
  const prdQuery = useExistingPrd(projectId);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const prdFeatures = useMemo(
    () =>
      new Map(
        (prdQuery.data?.content_json.features ?? []).map((feature) => [
          feature.id,
          feature.name,
        ]),
      ),
    [prdQuery.data],
  );
  const chunksByRef = useMemo(
    () => new Map(chunks.map((chunk) => [chunk.ref, chunk])),
    [chunks],
  );
  const chunksByColumn = useMemo(() => groupChunksByStatus(chunks), [chunks]);
  const activeChunk = activeId ? chunks.find((chunk) => chunk.id === activeId) : undefined;

  const requestMove = (chunk: ChunkRow, newStatus: ChunkStatus, newPosition: number) => {
    if (chunk.status === newStatus && chunk.position === newPosition) {
      return;
    }

    move.reset();
    move.mutate({ chunkId: chunk.id, newStatus, newPosition });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    const draggedId = String(active.id);
    const overId = String(over.id);
    const activeChunkForDrop = chunks.find((chunk) => chunk.id === draggedId);

    if (!activeChunkForDrop) {
      return;
    }

    if (overId.startsWith('column:')) {
      const newStatus = overId.replace('column:', '') as ChunkStatus;
      const columnChunks = chunksByColumn[newStatus].filter(
        (chunk) => chunk.id !== activeChunkForDrop.id,
      );
      const lastColumnChunk = columnChunks[columnChunks.length - 1];
      const newPosition = lastColumnChunk ? lastColumnChunk.position + 1 : 0;

      requestMove(activeChunkForDrop, newStatus, newPosition);
      return;
    }

    const overChunk = chunks.find((chunk) => chunk.id === overId);

    if (!overChunk) {
      return;
    }

    requestMove(activeChunkForDrop, overChunk.status, overChunk.position);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      {move.advancedStatus ? (
        <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>
            {CHUNKS_MESSAGES.MOVE_STATUS_ADVANCED_BANNERS[move.advancedStatus]}
          </AlertTitle>
        </Alert>
      ) : null}

      {move.isError ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{CHUNKS_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{CHUNKS_MESSAGES.MOVE_FAILED}</AlertDescription>
        </Alert>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CHUNK_STATUSES.map((status) => (
            <ChunkColumn
              key={status}
              projectId={projectId}
              status={status}
              chunks={chunksByColumn[status]}
              prdFeatures={prdFeatures}
              chunksByRef={chunksByRef}
              onStatusChange={(chunk, nextStatus) => {
                requestMove(chunk, nextStatus, chunk.position);
              }}
            />
          ))}
        </div>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeChunk ? (
            <ChunkCardCompact
              projectId={projectId}
              chunk={activeChunk}
              prdFeatures={prdFeatures}
              chunksByRef={chunksByRef}
              interactive={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function groupChunksByStatus(chunks: ChunkRow[]): Record<ChunkStatus, ChunkRow[]> {
  const grouped: Record<ChunkStatus, ChunkRow[]> = {
    backlog: [],
    in_progress: [],
    done: [],
    blocked: [],
  };

  for (const chunk of [...chunks].sort((left, right) => left.position - right.position)) {
    grouped[chunk.status].push(chunk);
  }

  return grouped;
}
