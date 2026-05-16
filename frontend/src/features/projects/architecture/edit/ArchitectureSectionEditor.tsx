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
import { ProseEditor } from '@/features/projects/_shared/edit/editors/ProseEditor';
import { StringListEditor } from '@/features/projects/_shared/edit/editors/StringListEditor';
import type {
  ArchitectureComponent,
  ArchitectureContent,
  ArchitectureDecision,
  ArchitectureExternalService,
  ArchitectureSectionKey,
} from '@shared/schemas/architecture';

import { ArchitectureComponentCard } from '../ArchitectureComponentCard';
import { ArchitectureDecisionCard } from '../ArchitectureDecisionCard';
import { ArchitectureExternalServiceCard } from '../ArchitectureExternalServiceCard';
import { ArchitectureSection } from '../ArchitectureSection';
import { ARCHITECTURE_MESSAGES } from '../messages';
import { ComponentListEditor } from './editors/ComponentListEditor';
import { DecisionListEditor } from './editors/DecisionListEditor';
import { ExternalServiceListEditor } from './editors/ExternalServiceListEditor';
import { ARCHITECTURE_EDIT_MESSAGES } from './messages';
import {
  createArchitectureSectionUpdate,
  getArchitectureSectionConfig,
  getArchitectureSectionValue,
  type ArchitectureSectionValue,
} from './section-config';
import { useRegenerateArchitectureSection } from './useRegenerateArchitectureSection';
import { useRegenerateSingleDecision } from './useRegenerateSingleDecision';
import { useSaveArchitectureSection } from './useSaveArchitectureSection';

type ArchitectureSectionEditorProps = {
  sectionKey: ArchitectureSectionKey;
  architectureContent: ArchitectureContent;
  projectId: string;
  onSaved: (newContent: ArchitectureContent) => void;
  onDirtyChange: (sectionKey: ArchitectureSectionKey, isDirty: boolean) => void;
};

type FailedAction = 'save' | 'regenerate' | 'decision_regenerate';

function valuesEqual(left: ArchitectureSectionValue, right: ArchitectureSectionValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function ListSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-2">
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

function getDecisionCounts(decisions: ArchitectureDecision[]) {
  return decisions.reduce(
    (counts, decision) => ({
      ...counts,
      [decision.status]: counts[decision.status] + 1,
    }),
    { proposed: 0, accepted: 0, superseded: 0, rejected: 0 },
  );
}

function renderReadOnly(sectionKey: ArchitectureSectionKey, content: ArchitectureContent) {
  switch (sectionKey) {
    case 'stack_overview':
      return <ProseSection text={content.stack_overview} />;
    case 'system_diagram_text':
      return <ProseSection text={content.system_diagram_text} />;
    case 'components':
      return (
        <div className="space-y-4">
          {content.components.map((component) => (
            <ArchitectureComponentCard key={component.id} component={component} />
          ))}
        </div>
      );
    case 'data_model':
      return <ProseSection text={content.data_model} />;
    case 'external_services':
      return content.external_services.length > 0 ? (
        <div className="space-y-4">
          {content.external_services.map((service) => (
            <ArchitectureExternalServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>
      );
    case 'auth_and_security':
      return <ProseSection text={content.auth_and_security} />;
    case 'hosting_and_deployment':
      return <ProseSection text={content.hosting_and_deployment} />;
    case 'decisions':
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            {ARCHITECTURE_EDIT_MESSAGES.DECISION_STATUS_SUMMARY(
              getDecisionCounts(content.decisions),
            )}
          </p>
          {content.decisions.length > 0 ? (
            <div className="space-y-4">
              {content.decisions.map((decision) => (
                <ArchitectureDecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>
          )}
        </div>
      );
    case 'open_questions':
      return <ListSection items={content.open_questions} />;
  }
}

export function ArchitectureSectionEditor({
  sectionKey,
  architectureContent,
  projectId,
  onSaved,
  onDirtyChange,
}: ArchitectureSectionEditorProps) {
  const config = getArchitectureSectionConfig(sectionKey);
  const originalValue = useMemo(
    () => getArchitectureSectionValue(architectureContent, sectionKey),
    [architectureContent, sectionKey],
  );
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState<ArchitectureSectionValue>(originalValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAction, setFailedAction] = useState<FailedAction | null>(null);
  const [failedDecisionId, setFailedDecisionId] = useState<string | null>(null);
  const [regeneratingDecisionId, setRegeneratingDecisionId] = useState<string | null>(null);
  const save = useSaveArchitectureSection(projectId);
  const regenerate = useRegenerateArchitectureSection(projectId);
  const regenerateDecision = useRegenerateSingleDecision(projectId);
  const isBusy = save.isPending || regenerate.isPending || regenerateDecision.isPending;
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
    setFailedDecisionId(null);

    try {
      const result = await save.mutateAsync({
        ...createArchitectureSectionUpdate(sectionKey, draft),
      });
      onSaved(result.contentJson);
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('save');
      setErrorMessage(ARCHITECTURE_EDIT_MESSAGES.SAVE_FAILED);
    }
  }

  async function regenerateSection() {
    setErrorMessage(null);
    setFailedAction(null);
    setFailedDecisionId(null);

    let output: Awaited<ReturnType<typeof regenerate.mutateAsync>>;

    try {
      output = await regenerate.mutateAsync(sectionKey);
    } catch {
      setFailedAction('regenerate');
      setErrorMessage(ARCHITECTURE_EDIT_MESSAGES.REGENERATE_FAILED);
      return;
    }

    setDraft(output.value);

    try {
      const result = await save.mutateAsync({
        ...createArchitectureSectionUpdate(sectionKey, output.value),
      });
      onSaved(result.contentJson);
      onDirtyChange(sectionKey, false);
      setMode('view');
    } catch {
      setFailedAction('save');
      setErrorMessage(ARCHITECTURE_EDIT_MESSAGES.SAVE_FAILED);
    }
  }

  async function regenerateSingleDecision(decisionId: string) {
    setErrorMessage(null);
    setFailedAction(null);
    setFailedDecisionId(null);
    setRegeneratingDecisionId(decisionId);

    try {
      const output = await regenerateDecision.mutateAsync(decisionId);
      const nextDecisions = (draft as ArchitectureDecision[]).map((decision) =>
        decision.id === decisionId ? output.value : decision,
      );
      setDraft(nextDecisions);

      try {
        const result = await save.mutateAsync({
          ...createArchitectureSectionUpdate('decisions', nextDecisions),
        });
        onSaved(result.contentJson);
        onDirtyChange(sectionKey, false);
        setMode('view');
      } catch {
        setFailedAction('save');
        setFailedDecisionId(null);
        setErrorMessage(ARCHITECTURE_EDIT_MESSAGES.SAVE_FAILED);
      }
    } catch {
      setFailedAction('decision_regenerate');
      setFailedDecisionId(decisionId);
      setErrorMessage(ARCHITECTURE_EDIT_MESSAGES.REGENERATE_FAILED);
    } finally {
      setRegeneratingDecisionId(null);
    }
  }

  function renderEditor() {
    switch (sectionKey) {
      case 'stack_overview':
      case 'system_diagram_text':
      case 'data_model':
      case 'auth_and_security':
      case 'hosting_and_deployment':
        return (
          <ProseEditor
            value={draft as string}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'components':
        return (
          <ComponentListEditor
            value={draft as ArchitectureComponent[]}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'external_services':
        return (
          <ExternalServiceListEditor
            value={draft as ArchitectureExternalService[]}
            disabled={isBusy}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
      case 'decisions':
        return (
          <DecisionListEditor
            value={draft as ArchitectureDecision[]}
            disabled={isBusy}
            regeneratingDecisionId={regeneratingDecisionId}
            onRegenerateDecision={regenerateSingleDecision}
            onChange={(value) => {
              setDraft(value);
            }}
          />
        );
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
    }
  }

  function retryFailedAction() {
    if (failedAction === 'save') {
      void saveDraft();
      return;
    }

    if (failedAction === 'regenerate') {
      void regenerateSection();
      return;
    }

    if (failedAction === 'decision_regenerate' && failedDecisionId) {
      void regenerateSingleDecision(failedDecisionId);
    }
  }

  if (mode === 'edit') {
    return (
      <section
        id={sectionKey === 'decisions' ? 'decisions' : undefined}
        className="space-y-4 rounded-lg border bg-muted/30 p-4"
      >
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
                setFailedDecisionId(null);
                setMode('view');
              }}
            >
              {ARCHITECTURE_EDIT_MESSAGES.CANCEL_BUTTON}
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
              {save.isPending
                ? ARCHITECTURE_EDIT_MESSAGES.SAVE_BUTTON_BUSY
                : ARCHITECTURE_EDIT_MESSAGES.SAVE_BUTTON}
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
              {ARCHITECTURE_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <ArchitectureSection
      id={sectionKey === 'decisions' ? 'decisions' : undefined}
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
              setFailedDecisionId(null);
              setMode('edit');
            }}
          >
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {ARCHITECTURE_EDIT_MESSAGES.EDIT_BUTTON}
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
                  ? ARCHITECTURE_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                  : ARCHITECTURE_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isBusy}
                  onClick={() => {
                    void regenerateSection();
                  }}
                >
                  {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      {isBusy ? <SectionSkeleton /> : renderReadOnly(sectionKey, architectureContent)}

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
            {ARCHITECTURE_EDIT_MESSAGES.TRY_AGAIN_BUTTON}
          </Button>
        </div>
      ) : null}
    </ArchitectureSection>
  );
}
