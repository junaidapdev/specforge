import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import type { CSSProperties } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { CHUNKS_MESSAGES } from '../messages';
import type { ChunkRow } from '../useChunks';
import { ChunkCardCompact } from './ChunkCardCompact';

type ChunkCardProps = {
  projectId: string;
  chunk: ChunkRow;
  prdFeatures: Map<string, string>;
  chunksByRef: Map<string, ChunkRow>;
  onStatusChange: (chunk: ChunkRow, status: ChunkStatus) => void;
};

export function ChunkCard({
  projectId,
  chunk,
  prdFeatures,
  chunksByRef,
  onStatusChange,
}: ChunkCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chunk.id,
    data: { type: 'chunk', chunkId: chunk.id, status: chunk.status },
  });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 shrink-0')}
      aria-label={CHUNKS_MESSAGES.CARD_DRAG_HANDLE_LABEL}
      title={CHUNKS_MESSAGES.CARD_REORDER_KEYBOARD_HINT}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <ChunkCardCompact
        projectId={projectId}
        chunk={chunk}
        prdFeatures={prdFeatures}
        chunksByRef={chunksByRef}
        dragHandle={dragHandle}
        onStatusChange={(status) => onStatusChange(chunk, status)}
      />
    </div>
  );
}
