import { FEATURE_SPEC_MESSAGES } from './messages';

export function NotesTab() {
  return (
    <div className="rounded-lg border p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {FEATURE_SPEC_MESSAGES.NOTES_TAB_PLACEHOLDER}
      </p>
    </div>
  );
}
