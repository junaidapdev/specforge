export const FEATURE_SPEC_MESSAGES = {
  PAGE_TITLE: 'Chunk',

  TAB_SPEC: 'Spec',
  TAB_PROMPT: 'Prompt',
  TAB_NOTES: 'Notes',

  PENDING_TITLE: 'Drafting your feature spec…',
  PENDING_BODY: 'This usually takes 30–60 seconds.',

  ERROR_TITLE: 'We could not generate this spec',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  REGENERATE_BUTTON: 'Regenerate spec',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this feature spec?',
  REGENERATE_CONFIRM_BODY: 'This replaces the current spec and resets the approved state.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',

  APPROVE_BUTTON: 'Approve spec',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'Spec approved.',
  APPROVE_ERROR: 'We could not approve this spec. Try again.',
  REGENERATE_ERROR: 'We could not regenerate this spec. Try again.',
  ACTION_ERROR_TITLE: 'Action failed',

  NEXT_CTA: 'Next: open the prompt',

  SECTION_GOAL: 'Goal',
  SECTION_SCOPE: 'Scope',
  SECTION_OUT_OF_SCOPE: 'Out of Scope',
  SECTION_TECHNICAL: 'Technical Requirements',
  SECTION_UI: 'UI Requirements',
  SECTION_SECURITY: 'Security Requirements',
  SECTION_ACCEPTANCE: 'Acceptance Criteria',

  CHUNK_HEADER_INCLUDES: 'Includes features',
  CHUNK_HEADER_DEPENDS: 'Depends on',
  CHUNK_HEADER_EFFORT: 'Effort',
  CHUNK_HEADER_STATUS: 'Status',
  EMPTY_VALUE: '(none)',
  UNKNOWN_SUFFIX: '(unknown)',

  NOTES_TAB_PLACEHOLDER: 'Notes will live here in a future update.',

  EDIT_NOTE: 'Edit each section below. Markdown is supported.',
  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
} as const;
