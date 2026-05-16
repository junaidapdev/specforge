export const CONTEXT_FILES_MESSAGES = {
  PAGE_TITLE: 'Context files',
  PAGE_SUBTITLE:
    'The orientation, standards, and workflow rules your AI coding tools will read.',

  PENDING_TITLE: 'Generating your context files…',
  PENDING_BODY: 'This usually takes 60–120 seconds. Seven documents in one pass.',

  ERROR_TITLE: 'We could not generate your context files',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Approve your architecture first',
  GATING_BODY: 'Context files build on your architecture. Approve the architecture, then come back.',
  GATING_OPEN_ARCHITECTURE: 'Open architecture',

  REGENERATE_ALL_BUTTON: 'Regenerate all',
  REGENERATE_ALL_CONFIRM_TITLE: 'Regenerate all context files?',
  REGENERATE_ALL_CONFIRM_BODY:
    'This replaces every context file and resets all approval states. Edits you have made will be lost.',
  REGENERATE_ALL_CONFIRM_CONFIRM: 'Yes, regenerate all',
  REGENERATE_ALL_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_ALL_ERROR: 'We could not regenerate all context files. Try again.',

  EDIT_BUTTON: 'Edit',
  CANCEL_BUTTON: 'Cancel',
  SAVE_BUTTON: 'Save',
  SAVE_BUTTON_BUSY: 'Saving…',
  SAVE_ERROR: 'We could not save this context file. Try again.',

  REGENERATE_DOC_BUTTON: 'Regenerate',
  REGENERATE_DOC_BUSY: 'Regenerating…',
  REGENERATE_DOC_CONFIRM_TITLE: 'Regenerate this document?',
  REGENERATE_DOC_CONFIRM_BODY:
    'This will replace the current content and reset its approved state. The other six docs are unchanged.',
  REGENERATE_DOC_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_DOC_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_DOC_INSTRUCTION_LABEL: 'Optional: tell the AI what to change',
  REGENERATE_DOC_INSTRUCTION_PLACEHOLDER:
    'e.g., "Make it shorter" or "Add a section about testing"',
  REGENERATE_DOC_ERROR: 'We could not regenerate this document. Try again.',

  APPROVE_BUTTON: 'Approve',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'Approved.',
  APPROVE_ERROR: 'We could not approve this context file. Try again.',

  APPROVAL_PROGRESS: (approved: number, total: number) => `${approved} of ${total} approved`,
  NEXT_CTA: 'Next: generate chunks',

  DOC_LABELS: {
    project_overview: 'Project overview',
    code_standards: 'Code standards',
    ai_workflow_rules: 'AI workflow rules',
    ui_context: 'UI context',
    agents_md: 'AGENTS.md',
    claude_md: 'CLAUDE.md',
    progress_tracker: 'Progress tracker',
  } as const,

  EDIT_NOTE: 'Edit in markdown. The rendered view updates after save.',
  DISCARD_DRAFT_TITLE: 'Discard unsaved edits?',
  DISCARD_DRAFT_BODY: 'Switching documents will discard the edits in this tab.',
  DISCARD_DRAFT_CONFIRM: 'Discard and switch',
  DISCARD_DRAFT_CANCEL: 'Keep editing',
  ACTION_ERROR_TITLE: 'Action failed',
  TRY_AGAIN: 'Try again',

  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
} as const;
