import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { ChunkEffortBadge, ChunkStatusBadge } from '@/features/projects/chunks/ChunkBadges';
import type { ChunkStatus } from '@shared/schemas/chunks';

import type { ChunkRow } from '../chunks/useChunks';
import { PROGRESS_MESSAGES } from './messages';

type ProgressByStatusSectionProps = {
  status: ChunkStatus;
  chunks: ChunkRow[];
  projectId: string;
};

export function ProgressByStatusSection({
  status,
  chunks,
  projectId,
}: ProgressByStatusSectionProps) {
  if (chunks.length === 0) {
    return null;
  }

  const orderedChunks = [...chunks].sort((left, right) => left.position - right.position);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          {PROGRESS_MESSAGES.STATUS_SECTION_LABELS[status]}
        </h2>
        <Badge variant="outline">{orderedChunks.length}</Badge>
      </div>
      <div className="space-y-2">
        {orderedChunks.map((chunk) => (
          <Link
            key={chunk.id}
            to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}
            className="flex flex-col gap-2 rounded-md border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-foreground">{chunk.title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{chunk.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <ChunkStatusBadge status={chunk.status} />
              <ChunkEffortBadge effort={chunk.estimated_effort} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
