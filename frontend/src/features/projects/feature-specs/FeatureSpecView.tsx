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
import type { FeatureSpecSectionKey } from '@shared/schemas/feature-spec';

import { FEATURE_SPEC_SECTION_ORDER } from './doc-config';
import { FeatureSpecActions } from './FeatureSpecActions';
import { FeatureSpecSectionEditor } from './edit/FeatureSpecSectionEditor';
import { FEATURE_SPEC_MESSAGES } from './messages';
import type { FeatureSpecRow } from './useExistingFeatureSpec';

type FeatureSpecViewProps = {
  spec: FeatureSpecRow;
  chunkId: string;
  onOpenPrompt: () => void;
};

export function FeatureSpecView({ spec, chunkId, onOpenPrompt }: FeatureSpecViewProps) {
  const [dirtyMap, setDirtyMap] = useState<Partial<Record<FeatureSpecSectionKey, boolean>>>({});
  const isDirty = useMemo(() => Object.values(dirtyMap).some(Boolean), [dirtyMap]);
  const blocker = useDirtyGuard(isDirty);
  const isNavigationBlocked = blocker.state === 'blocked';

  const handleDirtyChange = useCallback(
    (sectionKey: FeatureSpecSectionKey, dirty: boolean) => {
      setDirtyMap((current) => ({ ...current, [sectionKey]: dirty }));
    },
    [],
  );

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{FEATURE_SPEC_MESSAGES.EDIT_NOTE}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {FEATURE_SPEC_MESSAGES.VERSION_LABEL(spec.version)}
          </p>
          <p className="mt-0.5">
            {FEATURE_SPEC_MESSAGES.LAST_UPDATED_PREFIX} {formatRelativeTime(spec.updated_at)}
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {FEATURE_SPEC_SECTION_ORDER.map((sectionKey) => (
          <FeatureSpecSectionEditor
            key={sectionKey}
            sectionKey={sectionKey}
            specContent={spec.content_json}
            chunkId={chunkId}
            onDirtyChange={handleDirtyChange}
          />
        ))}
      </div>

      <FeatureSpecActions spec={spec} chunkId={chunkId} onOpenPrompt={onOpenPrompt} />

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
