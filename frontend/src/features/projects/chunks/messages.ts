export const CHUNKS_MESSAGES = {
  PAGE_TITLE: 'Chunks',
  PAGE_SUBTITLE: 'Shippable units of work, ready to hand to an AI coding agent.',

  PENDING_TITLE: 'Slicing your project into chunks…',
  PENDING_BODY: 'This usually takes 45–90 seconds.',

  ERROR_TITLE: 'We could not generate chunks',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Generate context files first',
  GATING_BODY: 'Chunks are built on your context files. Generate the context files, then come back.',
  GATING_OPEN_CONTEXT: 'Open context files',

  REGENERATE_ALL_BUTTON: 'Regenerate all chunks',
  REGENERATE_ALL_CONFIRM_TITLE: 'Regenerate all chunks?',
  REGENERATE_ALL_CONFIRM_BODY:
    'This deletes all existing chunks AND their feature specs. Any progress data is preserved but disconnected. Manual edits to chunk titles, descriptions, or order will be lost.',
  REGENERATE_ALL_CONFIRM_CONFIRM: 'Yes, regenerate everything',
  REGENERATE_ALL_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_ALL_ERROR: 'We could not regenerate all chunks. Try again.',

  STATUS_LABELS: {
    backlog: 'Backlog',
    in_progress: 'In progress',
    done: 'Done',
    blocked: 'Blocked',
  } as const,

  EFFORT_LABELS: {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
  } as const,

  EFFORT_TOOLTIPS: {
    xs: 'Under 2 hours',
    s: 'About half a day',
    m: 'About a day',
    l: '2–3 days',
    xl: 'A week or more',
  } as const,

  COUNT_LABEL: (count: number) => `${count} chunk${count === 1 ? '' : 's'}`,
  STATUS_ADVANCED_BANNER: 'Project moved to "Ready to build".',

  INCLUDED_FEATURES_LABEL: 'Includes features',
  DEPENDENCIES_LABEL: 'Depends on',
  UNKNOWN_SUFFIX: '(unknown)',
  NO_REFERENCES_HINT: '(none)',

  EMPTY_LIST_HINT: '(No chunks generated yet.)',
  BOARD_VIEW_PLACEHOLDER: 'Board view available in the next update.',
  ACTION_ERROR_TITLE: 'Action failed',
} as const;
