import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { CONTEXT_FILES_MESSAGES } from './messages';

type ContextDocEditorProps = {
  draft: string;
  isDirty: boolean;
  isSaving: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function ContextDocEditor({
  draft,
  isDirty,
  isSaving,
  onChange,
  onCancel,
  onSave,
}: ContextDocEditorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{CONTEXT_FILES_MESSAGES.EDIT_NOTE}</p>
      <Textarea
        aria-label={CONTEXT_FILES_MESSAGES.EDITOR_LABEL}
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={24}
        className="font-mono text-sm"
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          {CONTEXT_FILES_MESSAGES.CANCEL_BUTTON}
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaving || !isDirty}>
          {isSaving
            ? CONTEXT_FILES_MESSAGES.SAVE_BUTTON_BUSY
            : CONTEXT_FILES_MESSAGES.SAVE_BUTTON}
        </Button>
      </div>
    </div>
  );
}
