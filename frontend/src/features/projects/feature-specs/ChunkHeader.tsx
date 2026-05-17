import { ChunkEffortBadge, ChunkStatusBadge } from '@/features/projects/chunks/ChunkBadges';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

import { FEATURE_SPEC_MESSAGES } from './messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';

type ChunkHeaderProps = {
  chunk: ChunkRow;
  projectId: string;
};

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
        <ChunkStatusBadge status={chunk.status} />
        <ChunkEffortBadge effort={chunk.estimated_effort} />
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
