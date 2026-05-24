import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChunkEffortBadge, ChunkStatusBadge } from '@/features/projects/chunks/ChunkBadges';
import { useMoveChunk } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { FEATURE_SPEC_MESSAGES } from './messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';

const CHUNK_STATUSES: ChunkStatus[] = ['backlog', 'in_progress', 'done', 'blocked'];

type ChunkHeaderProps = {
  chunk: ChunkRow;
  projectId: string;
};

export function ChunkHeader({ chunk, projectId }: ChunkHeaderProps) {
  const prdQuery = useExistingPrd(projectId);
  const chunksQuery = useChunks(projectId);
  const move = useMoveChunk(projectId);
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
      {chunksQuery.data ? (
        <div className="w-full max-w-48 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {CHUNKS_MESSAGES.CARD_STATUS_LABEL}
          </p>
          <Select
            value={chunk.status}
            onValueChange={(value) => {
              move.reset();
              move.mutate({
                chunkId: chunk.id,
                newStatus: value as ChunkStatus,
                newPosition: chunk.position,
              });
            }}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHUNK_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {CHUNKS_MESSAGES.STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{CHUNKS_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{CHUNKS_MESSAGES.MOVE_FAILED}</AlertDescription>
        </Alert>
      ) : null}
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
