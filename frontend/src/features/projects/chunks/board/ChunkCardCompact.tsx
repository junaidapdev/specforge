import { GitBranch, ListChecks } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks';

import { CHUNKS_MESSAGES } from '../messages';
import type { ChunkRow } from '../useChunks';

const CHUNK_STATUSES: ChunkStatus[] = ['backlog', 'in_progress', 'done', 'blocked'];

type ChunkCardCompactProps = {
  projectId: string;
  chunk: ChunkRow;
  prdFeatures: Map<string, string>;
  chunksByRef: Map<string, ChunkRow>;
  dragHandle?: ReactNode;
  interactive?: boolean;
  onStatusChange?: (status: ChunkStatus) => void;
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

export function ChunkCardCompact({
  projectId,
  chunk,
  prdFeatures,
  chunksByRef,
  dragHandle,
  interactive = true,
  onStatusChange,
}: ChunkCardCompactProps) {
  const featureLabels = chunk.included_features.map(
    (id) => prdFeatures.get(id) ?? `${id} ${CHUNKS_MESSAGES.UNKNOWN_SUFFIX}`,
  );
  const dependencyLabels = chunk.dependencies.map(
    (ref) => chunksByRef.get(ref)?.title ?? `${ref} ${CHUNKS_MESSAGES.UNKNOWN_SUFFIX}`,
  );

  return (
    <article className="space-y-4 rounded-md border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
            {chunk.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(chunk.status)}>
              {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
            </Badge>
            <EffortBadge effort={chunk.estimated_effort} />
          </div>
        </div>
        {dragHandle}
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {chunk.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <ReferenceCount
          icon={<ListChecks className="h-3.5 w-3.5" aria-hidden="true" />}
          label={CHUNKS_MESSAGES.INCLUDED_FEATURES_LABEL}
          countLabel={CHUNKS_MESSAGES.FEATURE_COUNT_LABEL(featureLabels.length)}
          values={featureLabels}
        />
        <ReferenceCount
          icon={<GitBranch className="h-3.5 w-3.5" aria-hidden="true" />}
          label={CHUNKS_MESSAGES.DEPENDENCIES_LABEL}
          countLabel={CHUNKS_MESSAGES.DEPENDENCY_COUNT_LABEL(dependencyLabels.length)}
          values={dependencyLabels}
        />
      </div>

      {interactive ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {CHUNKS_MESSAGES.CARD_STATUS_LABEL}
            </p>
            <Select
              value={chunk.status}
              onValueChange={(value) => onStatusChange?.(value as ChunkStatus)}
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

          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}>
              {CHUNKS_MESSAGES.CARD_OPEN_BUTTON}
            </Link>
          </Button>
        </div>
      ) : null}
    </article>
  );
}

type ReferenceCountProps = {
  icon: ReactNode;
  label: string;
  countLabel: string;
  values: string[];
};

function ReferenceCount({ icon, label, countLabel, values }: ReferenceCountProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex cursor-help items-center gap-1.5"
          aria-label={`${label}: ${countLabel}`}
        >
          {icon}
          {countLabel}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {values.length > 0 ? values.join(', ') : CHUNKS_MESSAGES.NO_REFERENCES_HINT}
      </TooltipContent>
    </Tooltip>
  );
}
