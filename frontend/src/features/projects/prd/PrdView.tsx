import { useCallback, useMemo, useState } from 'react';

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
import { SHARED_EDIT_MESSAGES } from '@/features/projects/_shared/edit/messages';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import { formatRelativeTime } from '@/lib/relative-time';
import type { PrdSectionKey } from '@shared/schemas/prd';

import { PrdSectionEditor } from './edit/PrdSectionEditor';
import { PRD_SECTION_CONFIG } from './edit/section-config';
import { PRD_MESSAGES } from './messages';
import { PrdActions } from './PrdActions';
import type { PrdRow } from './useExistingPrd';

type PrdViewProps = {
  prd: PrdRow;
  projectId: string;
};

export function PrdView({ prd, projectId }: PrdViewProps) {
  const content = prd.content_json;
  const [dirtyMap, setDirtyMap] = useState<Partial<Record<PrdSectionKey, boolean>>>({});
  const isDirty = useMemo(() => Object.values(dirtyMap).some(Boolean), [dirtyMap]);
  const blocker = useDirtyGuard(isDirty);
  const handleDirtyChange = useCallback((sectionKey: PrdSectionKey, dirty: boolean) => {
    setDirtyMap((current) => ({ ...current, [sectionKey]: dirty }));
  }, []);
  const handleSaved = useCallback((sectionKey: PrdSectionKey) => {
    setDirtyMap((current) => ({ ...current, [sectionKey]: false }));
  }, []);
  const isNavigationBlocked = blocker.state === 'blocked';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{PRD_MESSAGES.PAGE_TITLE}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{PRD_MESSAGES.PAGE_SUBTITLE}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{PRD_MESSAGES.VERSION_LABEL(prd.version)}</p>
            <p className="mt-0.5">
              {PRD_MESSAGES.LAST_UPDATED_PREFIX} {formatRelativeTime(prd.updated_at)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {PRD_SECTION_CONFIG.map((section) => (
          <PrdSectionEditor
            key={section.key}
            sectionKey={section.key}
            prdContent={content}
            projectId={projectId}
            onDirtyChange={handleDirtyChange}
            onSaved={() => {
              handleSaved(section.key);
            }}
          />
        ))}
      </div>

      <PrdActions prd={prd} projectId={projectId} />

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
