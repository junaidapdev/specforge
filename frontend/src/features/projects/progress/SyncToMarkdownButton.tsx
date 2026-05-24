import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';

import type { ChunkRow } from '../chunks/useChunks';
import { PROGRESS_MESSAGES } from './messages';
import { useSyncProgressToMarkdown } from './useSyncProgressToMarkdown';

type SyncToMarkdownButtonProps = {
  projectId: string;
  project: Pick<Project, 'name' | 'status'>;
  chunks: ChunkRow[];
};

export function SyncToMarkdownButton({
  projectId,
  project,
  chunks,
}: SyncToMarkdownButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const sync = useSyncProgressToMarkdown(projectId);

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      <Button
        type="button"
        variant="outline"
        disabled={sync.isPending}
        onClick={() => {
          sync.reset();
          setConfirmOpen(true);
        }}
      >
        {sync.isPending ? PROGRESS_MESSAGES.SYNC_BUTTON_BUSY : PROGRESS_MESSAGES.SYNC_BUTTON}
      </Button>

      {sync.isSuccess ? (
        <Alert className="max-w-sm border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{PROGRESS_MESSAGES.SYNC_SUCCESS}</AlertTitle>
        </Alert>
      ) : null}

      {sync.isError ? (
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{PROGRESS_MESSAGES.SYNC_ERROR}</AlertTitle>
        </Alert>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{PROGRESS_MESSAGES.SYNC_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{PROGRESS_MESSAGES.SYNC_CONFIRM_BODY}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{PROGRESS_MESSAGES.SYNC_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                sync.mutate({ project, chunks });
              }}
            >
              {PROGRESS_MESSAGES.SYNC_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
