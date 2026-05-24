const CHUNK_STATUS_LABELS = {
  backlog: 'Backlog',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
} as const;

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

  STATUS_LABELS: CHUNK_STATUS_LABELS,

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
  MOVE_STATUS_ADVANCED_BANNERS: {
    building: 'Project moved to "Building".',
    completed: 'Project moved to "Completed".',
  } as const,

  INCLUDED_FEATURES_LABEL: 'Includes features',
  DEPENDENCIES_LABEL: 'Depends on',
  FEATURE_COUNT_LABEL: (count: number) => `${count} feature${count === 1 ? '' : 's'}`,
  DEPENDENCY_COUNT_LABEL: (count: number) =>
    `${count} dependenc${count === 1 ? 'y' : 'ies'}`,
  UNKNOWN_SUFFIX: '(unknown)',
  NO_REFERENCES_HINT: '(none)',

  COLUMN_LABELS: CHUNK_STATUS_LABELS,
  COLUMN_DESCRIPTIONS: {
    backlog: 'Not started',
    in_progress: 'Being worked on',
    done: 'Completed',
    blocked: 'Stuck or waiting',
  } as const,
  CARD_OPEN_BUTTON: 'Open',
  CARD_STATUS_LABEL: 'Status',
  CARD_DRAG_HANDLE_LABEL: 'Drag to reorder',
  CARD_REORDER_KEYBOARD_HINT: 'Use arrow keys to move',
  EMPTY_COLUMN_BACKLOG: 'All chunks have started.',
  EMPTY_COLUMN_IN_PROGRESS: 'Pick a chunk from the backlog to start.',
  EMPTY_COLUMN_DONE: 'Nothing shipped yet.',
  EMPTY_COLUMN_BLOCKED: 'Nothing blocked. 🟢',
  MOVE_FAILED: 'Could not move chunk. Reverting.',
  ACTION_ERROR_TITLE: 'Action failed',
} as const;
