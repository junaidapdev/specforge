import { Badge } from '@/components/ui/badge';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks';

import { FEATURE_SPEC_MESSAGES } from './messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';

type ChunkHeaderProps = {
  chunk: ChunkRow;
  projectId: string;
};

function getStatusVariant(status: ChunkStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'in_progress') return 'default';
  if (status === 'done') return 'secondary';
  if (status === 'blocked') return 'destructive';
  return 'outline';
}

function EffortBadge({ effort }: { effort: ChunkEffort }) {
  return <Badge variant="outline">{CHUNKS_MESSAGES.EFFORT_LABELS[effort]}</Badge>;
}

export function ChunkHeader({ chunk, projectId }: ChunkHeaderProps) {
  const prdQuery = useExistingPrd(projectId);
  const chunksQuery = useChunks(projectId);
  const featureMap = new Map(
    (prdQuery.data?.content_json.features ?? []).map((feature) => [feature.id, feature.name]),
  );
  const chunksByRef = new Map((chunksQuery.data ?? []).map((item) => [item.ref, item]));
  const includedFeatureNames = chunk.included_features.map(
    (id) => featureMap.get(id) ?? `${id} ${FEATURE_SPEC_MESSAGES.UNKNOWN_SUFFIX}`,
  );
  const dependencyTitles = chunk.dependencies.map(
    (ref) => chunksByRef.get(ref)?.title ?? `${ref} ${FEATURE_SPEC_MESSAGES.UNKNOWN_SUFFIX}`,
  );

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{chunk.title}</h1>
        <Badge variant={getStatusVariant(chunk.status)}>
          {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
        </Badge>
        <EffortBadge effort={chunk.estimated_effort} />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{chunk.description}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span>
          <strong>{FEATURE_SPEC_MESSAGES.CHUNK_HEADER_INCLUDES}:</strong>{' '}
          {includedFeatureNames.join(', ') || FEATURE_SPEC_MESSAGES.EMPTY_VALUE}
        </span>
        <span>
          <strong>{FEATURE_SPEC_MESSAGES.CHUNK_HEADER_DEPENDS}:</strong>{' '}
          {dependencyTitles.join(', ') || FEATURE_SPEC_MESSAGES.EMPTY_VALUE}
        </span>
      </div>
    </header>
  );
}
