import { useProject } from '@/features/projects/layout/useProject';

import { BriefStatusPanel } from './BriefStatusPanel';
import { ChunksProgressPanel } from './ChunksProgressPanel';
import { ExportShortcutPanel } from './ExportShortcutPanel';
import { NextActionPanel } from './NextActionPanel';
import { OpenIssuesPanel } from './OpenIssuesPanel';
import { ProjectSummaryPanel } from './ProjectSummaryPanel';
import { RecentDecisionsPanel } from './RecentDecisionsPanel';

export function OverviewPage() {
  const { project } = useProject();

  return (
    <div className="space-y-6">
      <ProjectSummaryPanel project={project} />
      <NextActionPanel project={project} />
      <ChunksProgressPanel projectId={project.id} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BriefStatusPanel projectId={project.id} />
        <OpenIssuesPanel projectId={project.id} />
        <RecentDecisionsPanel projectId={project.id} />
        <ExportShortcutPanel projectId={project.id} />
      </div>
    </div>
  );
}
