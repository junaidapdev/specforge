import { Loader2, Pencil, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import {
  type FeatureSpecContent,
  type FeatureSpecSectionKey,
} from '@shared/schemas/feature-spec';

import { FEATURE_SPEC_SECTION_LABELS } from '../doc-config';
import { FeatureSpecSection } from '../FeatureSpecSection';
import { FEATURE_SPEC_MESSAGES } from '../messages';
import { FEATURE_SPEC_EDIT_MESSAGES } from './messages';
import { useRegenerateFeatureSpecSection } from './useRegenerateFeatureSpecSection';
import { useSaveFeatureSpecSection } from './useSaveFeatureSpecSection';

type FeatureSpecSectionEditorProps = {
  sectionKey: FeatureSpecSectionKey;
  specContent: FeatureSpecContent;
  chunkId: string;
  onDirtyChange: (sectionKey: FeatureSpecSectionKey, isDirty: boolean) => void;
};

type FailedAction = 'save' | 'regenerate';

export function FeatureSpecSectionEditor({
  sectionKey,
  specContent,
  chunkId,
  onDirtyChange,
}: FeatureSpecSectionEditorProps) {
  const originalValue = useMemo(() => specContent[sectionKey], [sectionKey, specContent]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState(originalValue);
  const [instruction, setInstruction] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAction, setFailedAction] = useState<FailedAction | null>(null);
  const save = useSaveFeatureSpecSection(chunkId);
  const regenerate = useRegenerateFeatureSpecSection(chunkId);
  const isBusy = save.isPending || regenerate.isPending;
  const isDirty = mode === 'edit' && draft !== originalValue;
  const sectionLabel = FEATURE_SPEC_SECTION_LABELS[sectionKey];

  useEffect(() => {
    onDirtyChange(sectionKey, isDirty);

    return () => {
      onDirtyChange(sectionKey, false);
    };
  }, [isDirty, onDirtyChange, sectionKey]);

  async function saveDraft() {
    setErrorMessage(null);
    setFailedAction(null);

    try {
      await save.mutateAsync({ sectionKey, value: draft });
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('save');
      setErrorMessage(FEATURE_SPEC_EDIT_MESSAGES.SAVE_FAILED);
    }
  }

  async function regenerateSection() {
    setErrorMessage(null);
    setFailedAction(null);

    let output: Awaited<ReturnType<typeof regenerate.mutateAsync>>;

    try {
      output = await regenerate.mutateAsync({
        sectionKey,
        userInstruction: instruction.trim() || undefined,
      });
    } catch {
      setFailedAction('regenerate');
      setErrorMessage(FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_FAILED);
      return;
    }

    setDraft(output.content);
    setInstruction('');

    try {
      await save.mutateAsync({ sectionKey, value: output.content });
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('save');
      setErrorMessage(FEATURE_SPEC_EDIT_MESSAGES.SAVE_FAILED);
    }
  }

  function retryFailedAction() {
    if (failedAction === 'save') {
      void saveDraft();
      return;
    }

    if (failedAction === 'regenerate') {
      void regenerateSection();
    }
  }

  if (mode === 'edit') {
    return (
      <section className="space-y-4 rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">{sectionLabel}</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(originalValue);
                setMode('view');
                setErrorMessage(null);
                setFailedAction(null);
              }}
              disabled={isBusy}
            >
              {FEATURE_SPEC_EDIT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button type="button" onClick={() => void saveDraft()} disabled={isBusy || !isDirty}>
              {save.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                  {FEATURE_SPEC_EDIT_MESSAGES.SAVE_BUTTON_BUSY}
                </>
              ) : (
                FEATURE_SPEC_EDIT_MESSAGES.SAVE_BUTTON
              )}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{FEATURE_SPEC_MESSAGES.EDIT_NOTE}</p>
        <Textarea
          aria-label={FEATURE_SPEC_EDIT_MESSAGES.EDITOR_LABEL(sectionLabel)}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={18}
          className="font-mono text-sm leading-relaxed"
          disabled={isBusy}
        />

        {errorMessage ? (
          <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
            <AlertTitle>{FEATURE_SPEC_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{errorMessage}</p>
              <Button type="button" size="sm" variant="outline" onClick={retryFailedAction}>
                {FEATURE_SPEC_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FeatureSpecSection sectionKey={sectionKey} markdown={originalValue} />
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(originalValue);
              setMode('edit');
            }}
            disabled={isBusy}
          >
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {FEATURE_SPEC_EDIT_MESSAGES.EDIT_BUTTON}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={isBusy}>
                {regenerate.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                )}
                {regenerate.isPending
                  ? FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                  : FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`feature-spec-instruction-${sectionKey}`}>
                  {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_INSTRUCTION_LABEL}
                </label>
                <Textarea
                  id={`feature-spec-instruction-${sectionKey}`}
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  placeholder={FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_INSTRUCTION_PLACEHOLDER}
                  rows={4}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isBusy}
                  onClick={() => {
                    void regenerateSection();
                  }}
                >
                  {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {errorMessage ? (
        <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <AlertTitle>{FEATURE_SPEC_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{errorMessage}</p>
            <Button type="button" size="sm" variant="outline" onClick={retryFailedAction}>
              {FEATURE_SPEC_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
