import { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, RefreshCw } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import type {
  PrdContent,
  PrdFeature,
  PrdSectionKey,
  PrdUserStory,
} from '@shared/schemas/prd';

import { PRD_MESSAGES } from '../messages';
import { PrdFeatureCard } from '../PrdFeatureCard';
import { PrdSection } from '../PrdSection';
import { PrdUserStoryCard } from '../PrdUserStoryCard';
import { FeatureListEditor } from './editors/FeatureListEditor';
import { ProseEditor } from './editors/ProseEditor';
import { StringListEditor } from './editors/StringListEditor';
import { UserStoryListEditor } from './editors/UserStoryListEditor';
import { PRD_EDIT_MESSAGES } from './messages';
import {
  getSectionConfig,
  getSectionValue,
  setSectionValue,
  type PrdSectionValue,
} from './section-config';
import { useRegeneratePrdSection } from './useRegeneratePrdSection';
import { useSavePrdSection } from './useSavePrdSection';

type PrdSectionEditorProps = {
  sectionKey: PrdSectionKey;
  prdContent: PrdContent;
  projectId: string;
  onSaved: (newContent: PrdContent) => void;
  onDirtyChange: (sectionKey: PrdSectionKey, isDirty: boolean) => void;
};

type FailedAction = 'save' | 'regenerate';

function valuesEqual(left: PrdSectionValue, right: PrdSectionValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function ListSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-1.5">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function ProseSection({ text }: { text: string }) {
  return <p className="whitespace-pre-line">{text}</p>;
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-11/12" />
      <Skeleton className="h-5 w-4/5" />
    </div>
  );
}

function renderReadOnly(sectionKey: PrdSectionKey, content: PrdContent) {
  switch (sectionKey) {
    case 'goal':
      return <ProseSection text={content.goal} />;
    case 'target_users':
      return <ListSection items={content.target_users} />;
    case 'problem_statement':
      return <ProseSection text={content.problem_statement} />;
    case 'success_criteria':
      return <ListSection items={content.success_criteria} />;
    case 'features':
      return (
        <div className="grid grid-cols-1 gap-4">
          {content.features.map((feature) => (
            <PrdFeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      );
    case 'user_stories':
      return content.user_stories.length > 0 ? (
        <div className="space-y-4">
          {content.user_stories.map((story) => (
            <PrdUserStoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>
      );
    case 'out_of_scope':
      return <ListSection items={content.out_of_scope} />;
    case 'open_questions':
      return <ListSection items={content.open_questions} />;
  }
}

export function PrdSectionEditor({
  sectionKey,
  prdContent,
  projectId,
  onSaved,
  onDirtyChange,
}: PrdSectionEditorProps) {
  const config = getSectionConfig(sectionKey);
  const originalValue = useMemo(
    () => getSectionValue(prdContent, sectionKey),
    [prdContent, sectionKey],
  );
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState<PrdSectionValue>(originalValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAction, setFailedAction] = useState<FailedAction | null>(null);
  const save = useSavePrdSection(projectId);
  const regenerate = useRegeneratePrdSection(projectId);
  const isBusy = save.isPending || regenerate.isPending;
  const isDirty = mode === 'edit' && !valuesEqual(draft, originalValue);

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
      const nextContent = setSectionValue(prdContent, sectionKey, draft);
      await save.mutateAsync(nextContent);
      onSaved(nextContent);
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('save');
      setErrorMessage(PRD_EDIT_MESSAGES.SAVE_FAILED);
    }
  }

  async function regenerateSection() {
    setErrorMessage(null);
    setFailedAction(null);

    try {
      const output = await regenerate.mutateAsync(sectionKey);
      const nextContent = setSectionValue(prdContent, sectionKey, output.value);
      setDraft(output.value);
      await save.mutateAsync(nextContent);
      onSaved(nextContent);
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('regenerate');
      setErrorMessage(PRD_EDIT_MESSAGES.REGENERATE_FAILED);
    }
  }

  function renderEditor() {
    switch (sectionKey) {
      case 'goal':
      case 'problem_statement':
        return (
          <ProseEditor
            value={draft as string}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'target_users':
      case 'success_criteria':
      case 'out_of_scope':
      case 'open_questions':
        return (
          <StringListEditor
            value={draft as string[]}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'features':
        return (
          <FeatureListEditor
            value={draft as PrdFeature[]}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'user_stories':
        return (
          <UserStoryListEditor
            value={draft as PrdUserStory[]}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
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
          <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isBusy}
              onClick={() => {
                setDraft(originalValue);
                setErrorMessage(null);
                setFailedAction(null);
                setMode('view');
              }}
            >
              {PRD_EDIT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isBusy || !isDirty}
              onClick={() => {
                void saveDraft();
              }}
            >
              {save.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {save.isPending ? PRD_EDIT_MESSAGES.SAVE_BUTTON_BUSY : PRD_EDIT_MESSAGES.SAVE_BUTTON}
            </Button>
          </div>
        </div>

        {regenerate.isPending ? <SectionSkeleton /> : renderEditor()}

        {errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <p className="text-destructive">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={isBusy}
              onClick={retryFailedAction}
            >
              {PRD_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <PrdSection
      title={config.label}
      actions={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => {
              setDraft(originalValue);
              setErrorMessage(null);
              setFailedAction(null);
              setMode('edit');
            }}
          >
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {PRD_EDIT_MESSAGES.EDIT_BUTTON}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" size="sm" disabled={isBusy}>
                {regenerate.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                )}
                {regenerate.isPending
                  ? PRD_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                  : PRD_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
                <AlertDialogDescription>
                  {PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isBusy}
                  onClick={() => {
                    void regenerateSection();
                  }}
                >
                  {PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      {isBusy ? <SectionSkeleton /> : renderReadOnly(sectionKey, prdContent)}

      {errorMessage ? (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <p className="text-destructive">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isBusy}
            onClick={retryFailedAction}
          >
            {PRD_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
          </Button>
        </div>
      ) : null}
    </PrdSection>
  );
}
