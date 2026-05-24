import { useProject } from '@/features/projects/layout/useProject';

import { useChunks } from '../chunks/useChunks';
import { ProgressByStatusSection } from './ProgressByStatusSection';
import { ProgressEmpty } from './ProgressEmpty';
import { ProgressError } from './ProgressError';
import { ProgressOverviewCard } from './ProgressOverviewCard';
import { ProgressPending } from './ProgressPending';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { PROGRESS_MESSAGES } from './messages';
import { SyncToMarkdownButton } from './SyncToMarkdownButton';

export function ProgressPage() {
  const { project } = useProject();
  const chunksQuery = useChunks(project.id);

  if (chunksQuery.isPending) {
    return <ProgressPending />;
  }

  if (chunksQuery.isError) {
    return (
      <ProgressError
        onRetry={() => {
          void chunksQuery.refetch();
        }}
      />
    );
  }

  const chunks = chunksQuery.data;

  if (chunks.length === 0) {
    return <ProgressEmpty projectId={project.id} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{PROGRESS_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{PROGRESS_MESSAGES.PAGE_SUBTITLE}</p>
        </div>
        <SyncToMarkdownButton projectId={project.id} project={project} chunks={chunks} />
      </header>

      <ProgressOverviewCard projectStatus={project.status} chunks={chunks} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProgressByStatusSection
            status="in_progress"
            chunks={chunks.filter((chunk) => chunk.status === 'in_progress')}
            projectId={project.id}
          />
          <ProgressByStatusSection
            status="blocked"
            chunks={chunks.filter((chunk) => chunk.status === 'blocked')}
            projectId={project.id}
          />
          <ProgressByStatusSection
            status="backlog"
            chunks={chunks.filter((chunk) => chunk.status === 'backlog')}
            projectId={project.id}
          />
          <ProgressByStatusSection
            status="done"
            chunks={chunks.filter((chunk) => chunk.status === 'done')}
            projectId={project.id}
          />
        </div>
        <RecentActivityTimeline chunks={chunks} projectId={project.id} />
      </div>
    </div>
  );
}
