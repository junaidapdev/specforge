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

import { CONTEXT_FILES_MESSAGES } from './messages';
import { useGenerateContextFiles } from './useGenerateContextFiles';

type ContextFilesPageActionsProps = {
  projectId: string;
};

export function ContextFilesPageActions({ projectId }: ContextFilesPageActionsProps) {
  const regenerateAll = useGenerateContextFiles();

  return (
    <div className="space-y-3">
      {regenerateAll.isError ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{CONTEXT_FILES_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{CONTEXT_FILES_MESSAGES.REGENERATE_ALL_ERROR}</AlertDescription>
        </Alert>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" disabled={regenerateAll.isPending}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_BUTTON}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={regenerateAll.isPending}
              onClick={() => {
                regenerateAll.reset();
                regenerateAll.mutate({ projectId });
              }}
            >
              {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
