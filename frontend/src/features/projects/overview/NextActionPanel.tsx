import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import type { Project } from '@/types/project';

import { Compass } from './icons';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';
import { recommendNextAction, type NextAction } from './recommend-next-action';
import { useArchitectureState } from './stubs/useArchitectureState';
import { useChunksState } from './stubs/useChunksState';
import { useContextFilesState } from './stubs/useContextFilesState';
import { usePrdState } from './stubs/usePrdState';

type NextActionPanelProps = {
  project: Project;
};

function useNextAction(project: Project): {
  action: NextAction | null;
  isPending: boolean;
  isError: boolean;
  retry: () => void;
} {
  const brief = useExistingBrief(project.id);
  const prd = usePrdState(project.id);
  const architecture = useArchitectureState(project.id);
  const contextFiles = useContextFilesState(project.id);
  const chunks = useChunksState(project.id);

  if (brief.isPending || prd.isLoading || architecture.isLoading) {
    return {
      action: null,
      isPending: true,
      isError: false,
      retry: () => {
        void brief.refetch();
      },
    };
  }

  if (brief.isError || prd.isError || architecture.isError) {
    return {
      action: null,
      isPending: false,
      isError: true,
      retry: () => {
        void brief.refetch();
        prd.retry();
        architecture.retry();
      },
    };
  }

  return {
    action: recommendNextAction({
      project,
      briefExists: Boolean(brief.data),
      briefApproved: Boolean(brief.data?.is_final),
      prdExists: prd.exists,
      prdApproved: prd.approved,
      architectureExists: architecture.exists,
      architectureApproved: architecture.approved,
      contextFilesExist: contextFiles.exists,
      chunksExist: chunks.data.exists,
      hasInProgressChunk: chunks.data.hasInProgress,
      hasIncompleteChunk: chunks.data.hasIncomplete,
      allChunksDone: chunks.data.allDone,
    }),
    isPending: false,
    isError: false,
    retry: () => {
      void brief.refetch();
      architecture.retry();
    },
  };
}

export function NextActionPanel({ project }: NextActionPanelProps) {
  const { action, isPending, isError, retry } = useNextAction(project);

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.NEXT_ACTION_TITLE}
      icon={<Compass className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      className="border-primary/30"
      contentClassName="pb-6"
    >
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-9 w-24" />
        </div>
      ) : null}

      {isError ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {OVERVIEW_MESSAGES.NEXT_ACTION_ERROR_BODY}
          </p>
          <Button type="button" variant="outline" onClick={retry}>
            {OVERVIEW_MESSAGES.PANEL_RETRY}
          </Button>
        </div>
      ) : null}

      {action ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-semibold text-foreground">{action.label}</p>
          {action.to ? (
            <Button asChild className="w-full sm:w-auto">
              <Link to={action.to}>{OVERVIEW_MESSAGES.NEXT_ACTION_CTA_LABEL}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </PanelCard>
  );
}
