import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

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

import { FEATURE_SPEC_MESSAGES } from './messages';
import { useApproveFeatureSpec } from './useApproveFeatureSpec';
import { useGenerateFeatureSpec } from './useGenerateFeatureSpec';
import type { FeatureSpecRow } from './useExistingFeatureSpec';

type FeatureSpecActionsProps = {
  spec: FeatureSpecRow;
  chunkId: string;
  onOpenPrompt: () => void;
};

export function FeatureSpecActions({
  spec,
  chunkId,
  onOpenPrompt,
}: FeatureSpecActionsProps) {
  const regenerate = useGenerateFeatureSpec();
  const approve = useApproveFeatureSpec(chunkId);
  const [approveFailed, setApproveFailed] = useState(false);
  const [regenerateFailed, setRegenerateFailed] = useState(false);
  const isApproved = spec.is_final;

  async function approveSpec() {
    setApproveFailed(false);
    setRegenerateFailed(false);

    try {
      await approve.mutateAsync();
    } catch {
      setApproveFailed(true);
    }
  }

  async function regenerateSpec() {
    setApproveFailed(false);
    setRegenerateFailed(false);

    try {
      await regenerate.mutateAsync({ chunkId });
    } catch {
      setRegenerateFailed(true);
    }
  }

  return (
    <div className="space-y-4 border-t pt-6">
      {isApproved ? (
        <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>{FEATURE_SPEC_MESSAGES.APPROVED_BANNER}</AlertTitle>
          <AlertDescription>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onOpenPrompt}>
              {FEATURE_SPEC_MESSAGES.NEXT_CTA}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {approveFailed || regenerateFailed ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{FEATURE_SPEC_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription>
            {approveFailed
              ? FEATURE_SPEC_MESSAGES.APPROVE_ERROR
              : FEATURE_SPEC_MESSAGES.REGENERATE_ERROR}
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
              disabled={regenerate.isPending || approve.isPending}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {FEATURE_SPEC_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction
                disabled={regenerate.isPending}
                onClick={() => {
                  void regenerateSpec();
                }}
              >
                {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isApproved ? (
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={approve.isPending || regenerate.isPending}
            onClick={() => {
              void approveSpec();
            }}
          >
            {approve.isPending
              ? FEATURE_SPEC_MESSAGES.APPROVE_BUTTON_BUSY
              : FEATURE_SPEC_MESSAGES.APPROVE_BUTTON}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
