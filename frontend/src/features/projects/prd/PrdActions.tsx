import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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

import { PRD_MESSAGES } from './messages';
import { useApprovePrd } from './useApprovePrd';
import { useGeneratePrd } from './useGeneratePrd';
import type { PrdRow } from './useExistingPrd';

type PrdActionsProps = {
  prd: PrdRow;
  projectId: string;
};

export function PrdActions({ prd, projectId }: PrdActionsProps) {
  const regenerate = useGeneratePrd(projectId);
  const approve = useApprovePrd(projectId);

  const isApproved = prd.is_final;
  const isRegenerating = regenerate.isPending;
  const isApproving = approve.isPending;

  return (
    <div className="space-y-4 border-t pt-6">
      {isApproved ? (
        <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{PRD_MESSAGES.APPROVED_BANNER}</AlertTitle>
          <AlertDescription>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to={ROUTES.PROJECT_ARCHITECTURE(projectId)} className="inline-flex gap-1.5">
                {PRD_MESSAGES.NEXT_CTA}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </AlertDescription>
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
              {PRD_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{PRD_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {PRD_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{PRD_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction
                disabled={isRegenerating}
                onClick={() => {
                  regenerate.mutate({ projectId });
                }}
              >
                {PRD_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
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
              approve.mutate();
            }}
          >
            {isApproving ? PRD_MESSAGES.APPROVE_BUTTON_BUSY : PRD_MESSAGES.APPROVE_BUTTON}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
