import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks';

import { CHUNKS_MESSAGES } from './messages';

function getStatusVariant(
  status: ChunkStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'in_progress') return 'default';
  if (status === 'done') return 'secondary';
  if (status === 'blocked') return 'destructive';
  return 'outline';
}

export function ChunkStatusBadge({ status }: { status: ChunkStatus }) {
  return (
    <Badge variant={getStatusVariant(status)}>
      {CHUNKS_MESSAGES.STATUS_LABELS[status]}
    </Badge>
  );
}

export function ChunkEffortBadge({ effort }: { effort: ChunkEffort }) {
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
