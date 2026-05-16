import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks';

import { CHUNKS_MESSAGES } from './messages';
import type { ChunkRow } from './useChunks';

type ChunkListItemProps = {
  chunk: ChunkRow;
  prdFeatures: Map<string, string>;
  chunksByRef: Map<string, ChunkRow>;
};

function getStatusVariant(status: ChunkStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'in_progress') {
    return 'default';
  }

  if (status === 'done') {
    return 'secondary';
  }

  if (status === 'blocked') {
    return 'destructive';
  }

  return 'outline';
}

function EffortBadge({ effort }: { effort: ChunkEffort }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="cursor-help uppercase">
          {CHUNKS_MESSAGES.EFFORT_LABELS[effort]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{CHUNKS_MESSAGES.EFFORT_TOOLTIPS[effort]}</TooltipContent>
    </Tooltip>
  );
}

export function ChunkListItem({ chunk, prdFeatures, chunksByRef }: ChunkListItemProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-base font-medium leading-snug">{chunk.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(chunk.status)}>
              {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
            </Badge>
            <EffortBadge effort={chunk.estimated_effort} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{chunk.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChunkBadgeRow
          label={CHUNKS_MESSAGES.INCLUDED_FEATURES_LABEL}
          values={chunk.included_features}
          getLabel={(id) => prdFeatures.get(id) ?? `${id} ${CHUNKS_MESSAGES.UNKNOWN_SUFFIX}`}
        />
        <ChunkBadgeRow
          label={CHUNKS_MESSAGES.DEPENDENCIES_LABEL}
          values={chunk.dependencies}
          getLabel={(ref) => chunksByRef.get(ref)?.title ?? `${ref} ${CHUNKS_MESSAGES.UNKNOWN_SUFFIX}`}
        />
      </CardContent>
    </Card>
  );
}

type ChunkBadgeRowProps = {
  label: string;
  values: string[];
  getLabel: (value: string) => string;
};

function ChunkBadgeRow({ label, values, getLabel }: ChunkBadgeRowProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="font-normal">
              {getLabel(value)}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{CHUNKS_MESSAGES.NO_REFERENCES_HINT}</p>
      )}
    </div>
  );
}
