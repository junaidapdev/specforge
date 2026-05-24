export const PROGRESS_MESSAGES = {
  PAGE_TITLE: 'Progress',
  PAGE_SUBTITLE: 'Live state of the build.',

  PENDING_TITLE: 'Loading progress...',
  ERROR_TITLE: 'We could not load progress',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  EMPTY_TITLE: 'No chunks yet',
  EMPTY_BODY: 'Generate chunks first, then come back to track progress.',
  EMPTY_OPEN_CHUNKS: 'Open chunks',

  OVERVIEW_TITLE: 'Overview',
  OVERVIEW_TOTAL: 'Total',
  OVERVIEW_DONE: 'Done',
  OVERVIEW_IN_PROGRESS: 'In progress',
  OVERVIEW_BACKLOG: 'Backlog',
  OVERVIEW_BLOCKED: 'Blocked',
  PROJECT_STATUS_LABEL: 'Project status',

  STATUS_SECTION_LABELS: {
    in_progress: 'In progress',
    blocked: 'Blocked',
    backlog: 'Backlog',
    done: 'Done',
  } as const,

  RECENT_ACTIVITY_TITLE: 'Recent activity',
  RECENT_ACTIVITY_EMPTY: 'No activity yet.',
  RECENT_CHUNK_PREFIX: (status: string) => `Current state: ${status.toLowerCase()}`,

  SYNC_BUTTON: 'Sync to markdown',
  SYNC_BUTTON_BUSY: 'Syncing...',
  SYNC_CONFIRM_TITLE: 'Sync progress to markdown?',
  SYNC_CONFIRM_BODY:
    'This rewrites the Progress Tracker context file from the current chunk state. Any manual edits to the markdown will be replaced.',
  SYNC_CONFIRM_CONFIRM: 'Yes, sync',
  SYNC_CONFIRM_CANCEL: 'Cancel',
  SYNC_SUCCESS: 'Progress synced.',
  SYNC_ERROR: 'Sync failed. Try again.',
} as const;
