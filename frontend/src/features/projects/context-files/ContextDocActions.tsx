import { useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { CONTEXT_FILES_MESSAGES } from './messages';
import { useApproveContextFile } from './useApproveContextFile';
import type { ContextFileRow } from './useAllContextFiles';
import { useRegenerateContextDoc } from './useRegenerateContextDoc';
import { useSaveContextFile } from './useSaveContextFile';

type ContextDocActionsProps = {
  doc: ContextFileRow;
  projectId: string;
  onEnterEdit: () => void;
};

type FailedAction = 'approve' | 'regenerate' | 'save' | null;

export function ContextDocActions({ doc, projectId, onEnterEdit }: ContextDocActionsProps) {
  const approve = useApproveContextFile(projectId);
  const regenerate = useRegenerateContextDoc(projectId);
  const save = useSaveContextFile(projectId);
  const [instruction, setInstruction] = useState('');
  const [pendingGeneratedContent, setPendingGeneratedContent] = useState<string | null>(null);
  const [failedAction, setFailedAction] = useState<FailedAction>(null);

  const isBusy = approve.isPending || regenerate.isPending || save.isPending;
  const actionError =
    failedAction === 'approve'
      ? CONTEXT_FILES_MESSAGES.APPROVE_ERROR
      : failedAction === 'regenerate'
        ? CONTEXT_FILES_MESSAGES.REGENERATE_DOC_ERROR
        : failedAction === 'save'
          ? CONTEXT_FILES_MESSAGES.SAVE_ERROR
          : null;

  async function saveGeneratedContent(content: string) {
    try {
      await save.mutateAsync({ type: doc.type, content });
      setPendingGeneratedContent(null);
      setFailedAction(null);
    } catch {
      setPendingGeneratedContent(content);
      setFailedAction('save');
    }
  }

  async function handleRegenerate() {
    setFailedAction(null);

    try {
      const regenerated = await regenerate.mutateAsync({
        projectId,
        type: doc.type,
        userInstruction: instruction.trim() || undefined,
      });
      await saveGeneratedContent(regenerated.content);
      setInstruction('');
    } catch {
      setFailedAction('regenerate');
    }
  }

  async function handleApprove() {
    setFailedAction(null);

    try {
      await approve.mutateAsync(doc.type);
    } catch {
      setFailedAction('approve');
    }
  }

  return (
    <div className="space-y-4">
      {actionError ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{CONTEXT_FILES_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{actionError}</p>
            {failedAction === 'save' && pendingGeneratedContent ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void saveGeneratedContent(pendingGeneratedContent);
                }}
                disabled={save.isPending}
              >
                {CONTEXT_FILES_MESSAGES.TRY_AGAIN}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="outline" onClick={onEnterEdit} disabled={isBusy}>
          <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {CONTEXT_FILES_MESSAGES.EDIT_BUTTON}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" disabled={isBusy}>
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {regenerate.isPending
                ? CONTEXT_FILES_MESSAGES.REGENERATE_DOC_BUSY
                : CONTEXT_FILES_MESSAGES.REGENERATE_DOC_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {CONTEXT_FILES_MESSAGES.REGENERATE_DOC_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {CONTEXT_FILES_MESSAGES.REGENERATE_DOC_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`regen-instruction-${doc.type}`}>
                {CONTEXT_FILES_MESSAGES.REGENERATE_DOC_INSTRUCTION_LABEL}
              </Label>
              <Textarea
                id={`regen-instruction-${doc.type}`}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder={CONTEXT_FILES_MESSAGES.REGENERATE_DOC_INSTRUCTION_PLACEHOLDER}
                rows={4}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {CONTEXT_FILES_MESSAGES.REGENERATE_DOC_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isBusy}
                onClick={() => {
                  void handleRegenerate();
                }}
              >
                {CONTEXT_FILES_MESSAGES.REGENERATE_DOC_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!doc.is_final ? (
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              void handleApprove();
            }}
            disabled={isBusy}
          >
            {approve.isPending
              ? CONTEXT_FILES_MESSAGES.APPROVE_BUTTON_BUSY
              : CONTEXT_FILES_MESSAGES.APPROVE_BUTTON}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
