import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';

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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SHARED_EDIT_MESSAGES } from '@/features/projects/_shared/edit/messages';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import { formatRelativeTime } from '@/lib/relative-time';
import type { ContextFileType } from '@shared/schemas/context-files';

import { ContextDocActions } from './ContextDocActions';
import { ContextDocApprovalBanner } from './ContextDocApprovalBanner';
import { ContextDocEditor } from './ContextDocEditor';
import { ContextDocViewer } from './ContextDocViewer';
import { ContextFilesPageActions } from './ContextFilesPageActions';
import {
  CONTEXT_DOC_ORDER,
  CONTEXT_DOC_TOTAL,
  DEFAULT_CONTEXT_DOC_TYPE,
} from './doc-config';
import { CONTEXT_FILES_MESSAGES } from './messages';
import { useSaveContextFile } from './useSaveContextFile';
import type { ContextFileRow } from './useAllContextFiles';

type CompleteContextFiles = Record<ContextFileType, ContextFileRow>;

type ContextFilesViewProps = {
  projectId: string;
  docs: CompleteContextFiles;
};

export function ContextFilesView({ projectId, docs }: ContextFilesViewProps) {
  const [activeType, setActiveType] = useState<ContextFileType>(DEFAULT_CONTEXT_DOC_TYPE);
  const [editingType, setEditingType] = useState<ContextFileType | null>(null);
  const [draft, setDraft] = useState('');
  const [pendingTab, setPendingTab] = useState<ContextFileType | null>(null);
  const [editorSaveFailed, setEditorSaveFailed] = useState(false);
  const save = useSaveContextFile(projectId);

  const approvedCount = CONTEXT_DOC_ORDER.filter((type) => docs[type].is_final).length;
  const editingDoc = editingType ? docs[editingType] : null;
  const isDirty = editingDoc ? draft !== editingDoc.content : false;
  const blocker = useDirtyGuard(isDirty);
  const isNavigationBlocked = blocker.state === 'blocked';
  const isTabSwitchBlocked = Boolean(pendingTab);

  const completeDocs = useMemo(
    () => CONTEXT_DOC_ORDER.map((type) => docs[type]),
    [docs],
  );

  function beginEdit(doc: ContextFileRow) {
    setEditingType(doc.type);
    setDraft(doc.content);
    setEditorSaveFailed(false);
  }

  function switchTab(nextType: ContextFileType) {
    setActiveType(nextType);
    setEditingType(null);
    setDraft('');
    setEditorSaveFailed(false);
  }

  function requestTabChange(nextType: ContextFileType) {
    if (nextType === activeType) return;

    if (isDirty) {
      setPendingTab(nextType);
      return;
    }

    switchTab(nextType);
  }

  async function saveDraft() {
    if (!editingType) return;

    setEditorSaveFailed(false);

    try {
      await save.mutateAsync({ type: editingType, content: draft });
      setEditingType(null);
      setDraft('');
    } catch {
      setEditorSaveFailed(true);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {CONTEXT_FILES_MESSAGES.PAGE_TITLE}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CONTEXT_FILES_MESSAGES.PAGE_SUBTITLE}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-sm text-muted-foreground">
            {CONTEXT_FILES_MESSAGES.APPROVAL_PROGRESS(
              approvedCount,
              CONTEXT_DOC_TOTAL,
            )}
          </span>
          <ContextFilesPageActions projectId={projectId} />
        </div>
      </header>

      <Tabs
        value={activeType}
        onValueChange={(value) => {
          requestTabChange(value as ContextFileType);
        }}
      >
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
          {completeDocs.map((doc) => (
            <TabsTrigger key={doc.type} value={doc.type} className="shrink-0">
              {CONTEXT_FILES_MESSAGES.DOC_LABELS[doc.type]}
              {doc.is_final ? (
                <CheckCircle2
                  className="ml-1.5 h-3.5 w-3.5 text-green-600 dark:text-green-500"
                  aria-hidden="true"
                />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        {completeDocs.map((doc) => (
          <TabsContent key={doc.type} value={doc.type} className="mt-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {CONTEXT_FILES_MESSAGES.VERSION_LABEL(doc.version)}
                </p>
                <p className="mt-0.5">
                  {CONTEXT_FILES_MESSAGES.LAST_UPDATED_PREFIX}{' '}
                  {formatRelativeTime(doc.updated_at)}
                </p>
              </div>
            </div>

            {editingType === doc.type ? (
              <div className="space-y-4">
                {editorSaveFailed ? (
                  <Alert className="border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                    <AlertTitle>{CONTEXT_FILES_MESSAGES.ACTION_ERROR_TITLE}</AlertTitle>
                    <AlertDescription>{CONTEXT_FILES_MESSAGES.SAVE_ERROR}</AlertDescription>
                  </Alert>
                ) : null}
                <ContextDocEditor
                  draft={draft}
                  isDirty={isDirty}
                  isSaving={save.isPending}
                  onChange={setDraft}
                  onCancel={() => {
                    setEditingType(null);
                    setDraft('');
                    setEditorSaveFailed(false);
                  }}
                  onSave={() => {
                    void saveDraft();
                  }}
                />
              </div>
            ) : (
              <>
                <ContextDocActions
                  doc={doc}
                  projectId={projectId}
                  onEnterEdit={() => {
                    beginEdit(doc);
                  }}
                />
                {doc.is_final ? <ContextDocApprovalBanner /> : null}
                <ContextDocViewer doc={doc} />
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={isTabSwitchBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {CONTEXT_FILES_MESSAGES.DISCARD_DRAFT_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {CONTEXT_FILES_MESSAGES.DISCARD_DRAFT_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTab(null)}>
              {CONTEXT_FILES_MESSAGES.DISCARD_DRAFT_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingTab) return;
                switchTab(pendingTab);
                setPendingTab(null);
              }}
            >
              {CONTEXT_FILES_MESSAGES.DISCARD_DRAFT_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isNavigationBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{SHARED_EDIT_MESSAGES.DIRTY_BLOCK_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {SHARED_EDIT_MESSAGES.DIRTY_BLOCK_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (blocker.state === 'blocked') {
                  blocker.reset();
                }
              }}
            >
              {SHARED_EDIT_MESSAGES.DIRTY_BLOCK_STAY}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blocker.state === 'blocked') {
                  blocker.proceed();
                }
              }}
            >
              {SHARED_EDIT_MESSAGES.DIRTY_BLOCK_LEAVE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
