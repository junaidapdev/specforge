import type { ClarifyingQuestion } from '@shared/schemas/clarification';

export const CLARIFY_MESSAGES = {
  PAGE_TITLE: 'A few clarifying questions',
  PAGE_SUBTITLE:
    'Your answers help us generate a better project brief. Skip any you are not sure about.',
  PENDING_TITLE: 'Thinking through your project...',
  PENDING_BODY: 'This usually takes 5-15 seconds.',
  ERROR_TITLE: 'We could not generate questions',
  ERROR_BODY: 'Something went wrong. Try again, or skip ahead.',
  ERROR_RETRY: 'Try again',
  ERROR_SKIP: 'Skip clarifications',
  SUBMIT_BUTTON: 'Generate brief',
  SUBMIT_BUTTON_BUSY: 'Saving...',
  ANSWER_PLACEHOLDER: 'Your answer (optional)',
  SKIP_LINK: 'Skip clarifications and go straight to the brief',
  QUESTION_LABEL: (number: number) => `Question ${number}`,
  ANSWER_LABEL: (number: number) => `Answer for question ${number}`,
  ANSWER_MAX_MESSAGE: 'Answers must be 1000 characters or fewer.',
  ANSWER_COUNTER: (count: number, max: number) => `${count}/${max} characters`,
} as const;

export const CLARIFY_CATEGORY_LABELS: Record<
  NonNullable<ClarifyingQuestion['category']>,
  string
> = {
  problem: 'Problem',
  users: 'Users',
  scope: 'Scope',
  features: 'Features',
  tech: 'Tech',
  success_criteria: 'Success criteria',
  other: 'Other',
};
