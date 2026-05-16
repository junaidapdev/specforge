import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import { ROUTES } from '@/constants/routes';

import { ARCHITECTURE_MESSAGES } from './messages';
import { useApproveArchitecture } from './useApproveArchitecture';
import type { ArchitectureRow } from './useExistingArchitecture';
import { useGenerateArchitecture } from './useGenerateArchitecture';

type ArchitectureActionsProps = {
  architecture: ArchitectureRow;
  projectId: string;
};

export function ArchitectureActions({ architecture, projectId }: ArchitectureActionsProps) {
  const regenerate = useGenerateArchitecture(projectId);
  const approve = useApproveArchitecture(projectId);

  const isApproved = architecture.is_final;
  const isRegenerating = regenerate.isPending;
  const isApproving = approve.isPending;
  const actionErrorBody = regenerate.error
    ? ARCHITECTURE_MESSAGES.REGENERATE_ERROR_BODY
    : approve.error
      ? ARCHITECTURE_MESSAGES.APPROVE_ERROR_BODY
      : null;

  function clearActionErrors() {
    regenerate.reset();
    approve.reset();
  }

  return (
    <div className="space-y-4 border-t pt-6">
      {isApproved ? (
        <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{ARCHITECTURE_MESSAGES.APPROVED_BANNER}</AlertTitle>
          <AlertDescription>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to={ROUTES.PROJECT_CONTEXT(projectId)} className="inline-flex gap-1.5">
                {ARCHITECTURE_MESSAGES.NEXT_CTA}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {actionErrorBody ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{ARCHITECTURE_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{actionErrorBody}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isRegenerating || isApproving}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {ARCHITECTURE_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isRegenerating}
                onClick={() => {
                  clearActionErrors();
                  regenerate.mutate({ projectId });
                }}
              >
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isApproved ? (
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isApproving || isRegenerating}
            onClick={() => {
              clearActionErrors();
              approve.mutate();
            }}
          >
            {isApproving
              ? ARCHITECTURE_MESSAGES.APPROVE_BUTTON_BUSY
              : ARCHITECTURE_MESSAGES.APPROVE_BUTTON}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
