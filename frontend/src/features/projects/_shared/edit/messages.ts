export const SHARED_EDIT_MESSAGES = {
  ADD_ITEM_BUTTON: '+ Add item',
  REMOVE_BUTTON: 'Remove',
  MOVE_UP_LABEL: 'Move up',
  MOVE_DOWN_LABEL: 'Move down',
  FIELD_ITEM: (index: number) => `Item ${index + 1}`,
  DIRTY_BLOCK_TITLE: 'You have unsaved changes',
  DIRTY_BLOCK_BODY: 'Leaving this page will discard your unsaved edits. Continue?',
  DIRTY_BLOCK_LEAVE: 'Discard and leave',
  DIRTY_BLOCK_STAY: 'Stay on page',
} as const;
