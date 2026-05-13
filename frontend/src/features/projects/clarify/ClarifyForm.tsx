import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { ClarifyingQuestion as ClarifyingQuestionType } from '@shared/schemas/clarification';

import { ClarifyQuestion } from './ClarifyQuestion';
import { CLARIFY_MESSAGES } from './messages';

const ANSWER_MAX_LENGTH = 1000;
const AnswerSchema = z
  .string()
  .trim()
  .max(ANSWER_MAX_LENGTH, CLARIFY_MESSAGES.ANSWER_MAX_MESSAGE)
  .optional();

type AnswerFormValues = Record<string, string | undefined>;

export type ClarificationAnswer = {
  id: string;
  text: string;
  answer: string;
};

export type ClarificationHandoffState = {
  clarificationAnswers: ClarificationAnswer[];
};

type ClarifyFormProps = {
  projectId: string;
  questions: ClarifyingQuestionType[];
};

function createAnswerSchema(questions: ClarifyingQuestionType[]) {
  const shape: Record<string, typeof AnswerSchema> = {};

  for (const question of questions) {
    shape[question.id] = AnswerSchema;
  }

  return z.object(shape);
}

function createDefaultValues(questions: ClarifyingQuestionType[]): AnswerFormValues {
  return Object.fromEntries(questions.map((question) => [question.id, '']));
}

function getErrorMessage(message: unknown): string | undefined {
  return typeof message === 'string' ? message : undefined;
}

export function ClarifyForm({ projectId, questions }: ClarifyFormProps) {
  const navigate = useNavigate();
  const formSchema = useMemo(() => createAnswerSchema(questions), [questions]);
  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(questions),
  });
  const watchedAnswers = useWatch({ control: form.control });

  function handleSubmit(values: AnswerFormValues): void {
    const clarificationAnswers = questions
      .map((question) => ({
        id: question.id,
        text: question.text,
        answer: values[question.id]?.trim() ?? '',
      }))
      .filter((item) => item.answer.length > 0);

    navigate(ROUTES.PROJECT_BRIEF(projectId), {
      state: { clarificationAnswers } satisfies ClarificationHandoffState,
    });
  }

  const disabled = form.formState.isSubmitting;

  return (
    <form className="space-y-6" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = watchedAnswers[question.id];
          const error = form.formState.errors[question.id]?.message;

          return (
            <ClarifyQuestion
              key={question.id}
              answerLength={typeof answer === 'string' ? answer.length : 0}
              error={getErrorMessage(error)}
              index={index}
              maxLength={ANSWER_MAX_LENGTH}
              question={question}
              registration={form.register(question.id)}
            />
          );
        })}
      </div>

      <div className="space-y-3">
        <Button aria-busy={disabled} className="w-full sm:w-auto" disabled={disabled} type="submit">
          {disabled ? CLARIFY_MESSAGES.SUBMIT_BUTTON_BUSY : CLARIFY_MESSAGES.SUBMIT_BUTTON}
        </Button>
        <p className="text-sm text-muted-foreground">
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            to={ROUTES.PROJECT_BRIEF(projectId)}
          >
            {CLARIFY_MESSAGES.SKIP_LINK}
          </Link>
        </p>
      </div>
    </form>
  );
}
