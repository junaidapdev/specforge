import { Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/features/projects/feature-specs/prompt/useCopyToClipboard';
import { formatRelativeTime } from '@/lib/relative-time';

import { ISSUE_MESSAGES } from './messages';

type IssuePromptDisplayProps = {
  prompt: string;
  version: number;
  updatedAt: string;
  onRegenerate: () => void;
};

export function IssuePromptDisplay({
  prompt,
  version,
  updatedAt,
  onRegenerate,
}: IssuePromptDisplayProps) {
  const { state, copy } = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const copyLabel = state === 'done'
    ? ISSUE_MESSAGES.COPY_BUTTON_DONE
    : state === 'error'
    ? ISSUE_MESSAGES.COPY_BUTTON_ERROR
    : state === 'busy'
    ? ISSUE_MESSAGES.COPY_BUTTON_BUSY
    : ISSUE_MESSAGES.COPY_BUTTON;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ISSUE_MESSAGES.PROMPT_TITLE}</h2>
          <p className="text-sm text-muted-foreground">
            {ISSUE_MESSAGES.VERSION_LABEL(version)} · {ISSUE_MESSAGES.UPDATED_PREFIX}{' '}
            {formatRelativeTime(updatedAt)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={state === 'busy'}
            onClick={() => {
              void copy(prompt);
            }}
          >
            <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {copyLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {ISSUE_MESSAGES.REGENERATE_PROMPT_BUTTON}
          </Button>
        </div>
      </div>

      <article className="prose prose-slate max-w-none rounded-lg border p-5 dark:prose-invert sm:p-6">
        <ReactMarkdown skipHtml>{prompt}</ReactMarkdown>
      </article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ISSUE_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{ISSUE_MESSAGES.REGENERATE_CONFIRM_BODY}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ISSUE_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onRegenerate();
              }}
            >
              {ISSUE_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
