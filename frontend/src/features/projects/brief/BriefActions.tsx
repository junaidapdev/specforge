import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

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

import { BRIEF_MESSAGES } from './messages';
import { useApproveBrief } from './useApproveBrief';
import { useGenerateBrief } from './useGenerateBrief';
import type { BriefRow } from './useExistingBrief';

type BriefActionsProps = {
  brief: BriefRow;
  projectId: string;
};

export function BriefActions({ brief, projectId }: BriefActionsProps) {
  const regenerate = useGenerateBrief(projectId);
  const approve = useApproveBrief(projectId);

  const isApproved = brief.is_final;
  const isRegenerating = regenerate.isPending;
  const isApproving = approve.isPending;

  return (
    <div className="space-y-4 border-t pt-6">
      {isApproved ? (
        <div className="flex items-start gap-3 rounded-lg border border-green-600/40 bg-green-600/10 p-4 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">{BRIEF_MESSAGES.APPROVED_BANNER}</p>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.PROJECT_PRD(projectId)} className="inline-flex items-center gap-1.5">
                {BRIEF_MESSAGES.NEXT_CTA}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isRegenerating || isApproving}>
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {BRIEF_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{BRIEF_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {BRIEF_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{BRIEF_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  regenerate.mutate({});
                }}
              >
                {BRIEF_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isApproved ? (
          <Button
            type="button"
            disabled={isApproving || isRegenerating}
            onClick={() => {
              approve.mutate();
            }}
          >
            {isApproving ? BRIEF_MESSAGES.APPROVE_BUTTON_BUSY : BRIEF_MESSAGES.APPROVE_BUTTON}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
