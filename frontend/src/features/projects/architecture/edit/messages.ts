export const ARCHITECTURE_EDIT_MESSAGES = {
  EDIT_BUTTON: 'Edit',
  CANCEL_BUTTON: 'Cancel',
  SAVE_BUTTON: 'Save',
  SAVE_BUTTON_BUSY: 'Saving…',
  TRY_AGAIN_BUTTON: 'Try again',
  REGENERATE_SECTION_BUTTON: 'Regenerate',
  REGENERATE_SECTION_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this section?',
  REGENERATE_CONFIRM_BODY:
    "The current content of this section will be replaced. The architecture's approved state will be reset.",
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  ADD_COMPONENT_BUTTON: '+ Add component',
  ADD_EXTERNAL_SERVICE_BUTTON: '+ Add service',
  ADD_DECISION_BUTTON: '+ Add decision',
  REMOVE_BUTTON: 'Remove',
  SAVE_FAILED: 'We could not save your changes. Try again.',
  REGENERATE_FAILED: 'We could not regenerate this section. Try again.',
  FIELD_COMPONENT_NAME: 'Component name',
  FIELD_COMPONENT_DESCRIPTION: 'Description',
  FIELD_COMPONENT_RESPONSIBILITIES: 'Responsibilities',
  FIELD_SERVICE_NAME: 'Service name',
  FIELD_SERVICE_PURPOSE: 'Purpose',
  FIELD_SERVICE_NOTES: 'Notes',
  DECISION_TITLE_LABEL: 'Title',
  DECISION_CONTEXT_LABEL: 'Context',
  DECISION_DECISION_LABEL: 'Decision',
  DECISION_CONSEQUENCES_LABEL: 'Consequences',
  DECISION_STATUS_LABEL: 'Status',
  DECISION_REGENERATE: 'Regenerate this decision',
  DECISION_REGENERATE_CONFIRM_TITLE: 'Regenerate this decision?',
  DECISION_REGENERATE_CONFIRM_BODY:
    "The decision's content will be replaced. Other decisions are unchanged. The architecture's approved state will be reset.",
  DEFAULT_COMPONENT_NAME: 'New component',
  DEFAULT_COMPONENT_DESCRIPTION: 'Describe this component.',
  DEFAULT_COMPONENT_RESPONSIBILITY: 'Responsibility to define',
  DEFAULT_SERVICE_NAME: 'New service',
  DEFAULT_SERVICE_PURPOSE: 'Describe why this service is needed.',
  DEFAULT_DECISION_TITLE: 'New decision',
  DEFAULT_DECISION_CONTEXT: 'Describe the context for this decision.',
  DEFAULT_DECISION_DECISION: 'State the decision.',
  DEFAULT_DECISION_CONSEQUENCES: 'Describe the consequences.',
  DECISION_STATUS_SUMMARY: (counts: {
    proposed: number;
    accepted: number;
    superseded: number;
    rejected: number;
  }) =>
    [
      counts.accepted ? `${counts.accepted} accepted` : null,
      counts.proposed ? `${counts.proposed} proposed` : null,
      counts.superseded ? `${counts.superseded} superseded` : null,
      counts.rejected ? `${counts.rejected} rejected` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'No decisions yet',
} as const;
