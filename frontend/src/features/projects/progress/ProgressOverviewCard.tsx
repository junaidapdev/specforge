import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import type { ProjectStatus } from '@/types/project';
import type { ChunkStatus } from '@shared/schemas/chunks';

import type { ChunkRow } from '../chunks/useChunks';
import { PROGRESS_MESSAGES } from './messages';

type ProgressOverviewCardProps = {
  projectStatus: ProjectStatus;
  chunks: ChunkRow[];
};

export function ProgressOverviewCard({ projectStatus, chunks }: ProgressOverviewCardProps) {
  const counts = useMemo(() => countByStatus(chunks), [chunks]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{PROGRESS_MESSAGES.OVERVIEW_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {PROGRESS_MESSAGES.PROJECT_STATUS_LABEL}
          </span>
          <ProjectStatusBadge status={projectStatus} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <ProgressStat label={PROGRESS_MESSAGES.OVERVIEW_TOTAL} value={chunks.length} />
          <ProgressStat label={PROGRESS_MESSAGES.OVERVIEW_DONE} value={counts.done} />
          <ProgressStat
            label={PROGRESS_MESSAGES.OVERVIEW_IN_PROGRESS}
            value={counts.in_progress}
          />
          <ProgressStat label={PROGRESS_MESSAGES.OVERVIEW_BACKLOG} value={counts.backlog} />
          <ProgressStat label={PROGRESS_MESSAGES.OVERVIEW_BLOCKED} value={counts.blocked} />
        </div>
      </CardContent>
    </Card>
  );
}

function countByStatus(chunks: ChunkRow[]): Record<ChunkStatus, number> {
  return {
    backlog: chunks.filter((chunk) => chunk.status === 'backlog').length,
    in_progress: chunks.filter((chunk) => chunk.status === 'in_progress').length,
    done: chunks.filter((chunk) => chunk.status === 'done').length,
    blocked: chunks.filter((chunk) => chunk.status === 'blocked').length,
  };
}

function ProgressStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
