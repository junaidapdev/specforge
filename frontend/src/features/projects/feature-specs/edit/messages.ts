export const FEATURE_SPEC_EDIT_MESSAGES = {
  EDIT_BUTTON: 'Edit',
  CANCEL_BUTTON: 'Cancel',
  SAVE_BUTTON: 'Save',
  SAVE_BUTTON_BUSY: 'Saving…',
  TRY_AGAIN_BUTTON: 'Try again',
  REGENERATE_SECTION_BUTTON: 'Regenerate',
  REGENERATE_SECTION_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this section?',
  REGENERATE_CONFIRM_BODY:
    "The current content of this section will be replaced. Other sections are unchanged. The spec's approved state will be reset.",
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_INSTRUCTION_LABEL: 'Optional: tell the AI what to change',
  REGENERATE_INSTRUCTION_PLACEHOLDER:
    'e.g., "Add more manual tests" or "Make the UI requirements shorter"',
  EDITOR_LABEL: (sectionLabel: string) => `${sectionLabel} editor`,
  SAVE_FAILED: 'We could not save your changes. Try again.',
  REGENERATE_FAILED: 'We could not regenerate this section. Try again.',
} as const;
