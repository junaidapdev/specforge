import { RotateCcw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { CHUNKS_MESSAGES } from './messages';
import { useGenerateChunks } from './useGenerateChunks';

type ChunksPageActionsProps = {
  projectId: string;
};

export function ChunksPageActions({ projectId }: ChunksPageActionsProps) {
  const regenerate = useGenerateChunks();

  return (
    <div className="space-y-3">
      {regenerate.isError ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{CHUNKS_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{CHUNKS_MESSAGES.REGENERATE_ALL_ERROR}</AlertDescription>
        </Alert>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" disabled={regenerate.isPending}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {CHUNKS_MESSAGES.REGENERATE_ALL_BUTTON}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              disabled={regenerate.isPending}
              onClick={() => {
                regenerate.reset();
                regenerate.mutate({ projectId });
              }}
            >
              {CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
