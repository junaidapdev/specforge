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
import { formatRelativeTime } from '@/lib/relative-time';

import { PROMPT_MESSAGES } from './messages';
import { useCopyToClipboard } from './useCopyToClipboard';
import type { AgentPromptRow } from './useAgentPromptsForChunk';

type PromptDisplayProps = {
  prompt: AgentPromptRow;
  onRegenerate: () => void;
};

export function PromptDisplay({ prompt, onRegenerate }: PromptDisplayProps) {
  const { state, copy } = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const copyLabel = state === 'done'
    ? PROMPT_MESSAGES.COPY_BUTTON_DONE
    : state === 'error'
    ? PROMPT_MESSAGES.COPY_BUTTON_ERROR
    : state === 'busy'
    ? PROMPT_MESSAGES.COPY_BUTTON_BUSY
    : PROMPT_MESSAGES.COPY_BUTTON;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          {PROMPT_MESSAGES.VERSION_LABEL(prompt.version)} · {PROMPT_MESSAGES.UPDATED_PREFIX}{' '}
          {formatRelativeTime(prompt.updated_at)}
        </span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void copy(prompt.content);
            }}
            disabled={state === 'busy'}
          >
            <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {copyLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmOpen(true);
            }}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {PROMPT_MESSAGES.REGENERATE_BUTTON}
          </Button>
        </div>
      </div>

      <article className="prose prose-slate max-w-none dark:prose-invert">
        <ReactMarkdown skipHtml>{prompt.content}</ReactMarkdown>
      </article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{PROMPT_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {PROMPT_MESSAGES.REGENERATE_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{PROMPT_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onRegenerate();
              }}
            >
              {PROMPT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
