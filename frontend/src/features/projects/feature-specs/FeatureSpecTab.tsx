import { useEffect, useRef } from 'react';

import type { ChunkRow } from '@/features/projects/chunks/useChunks';

import { FeatureSpecError } from './FeatureSpecError';
import { FeatureSpecPending } from './FeatureSpecPending';
import { FeatureSpecView } from './FeatureSpecView';
import { useExistingFeatureSpec } from './useExistingFeatureSpec';
import { useGenerateFeatureSpec } from './useGenerateFeatureSpec';

type FeatureSpecTabProps = {
  chunk: ChunkRow;
  onOpenPrompt: () => void;
};

export function FeatureSpecTab({ chunk, onOpenPrompt }: FeatureSpecTabProps) {
  const specQuery = useExistingFeatureSpec(chunk.id);
  const generate = useGenerateFeatureSpec();
  const lastGeneratedChunkRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastGeneratedChunkRef.current === chunk.id) return;
    if (specQuery.isPending || specQuery.isError) return;
    if (specQuery.data) return;
    if (generate.isPending) return;

    lastGeneratedChunkRef.current = chunk.id;
    generate.mutate({ chunkId: chunk.id });
    // The chunk-scoped ref keeps first-visit generation idempotent in StrictMode
    // and after route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunk.id, specQuery.isPending, specQuery.isError, specQuery.data, generate.isPending]);

  if (specQuery.isPending) {
    return <FeatureSpecPending />;
  }

  if (specQuery.isError) {
    return (
      <FeatureSpecError
        onRetry={() => {
          void specQuery.refetch();
        }}
      />
    );
  }

  if (specQuery.data) {
    return <FeatureSpecView spec={specQuery.data} chunkId={chunk.id} onOpenPrompt={onOpenPrompt} />;
  }

  if (generate.isError) {
    return (
      <FeatureSpecError
        onRetry={() => {
          generate.mutate({ chunkId: chunk.id });
        }}
      />
    );
  }

  return <FeatureSpecPending />;
}
