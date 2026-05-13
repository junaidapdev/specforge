import type { UseFormRegisterReturn } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ClarifyingQuestion as ClarifyingQuestionType } from '@shared/schemas/clarification';

import {
  CLARIFY_CATEGORY_LABELS,
  CLARIFY_MESSAGES,
} from './messages';

type ClarifyQuestionProps = {
  answerLength: number;
  error?: string;
  index: number;
  maxLength: number;
  question: ClarifyingQuestionType;
  registration: UseFormRegisterReturn;
};

export function ClarifyQuestion({
  answerLength,
  error,
  index,
  maxLength,
  question,
  registration,
}: ClarifyQuestionProps) {
  const questionNumber = index + 1;
  const showCounter = answerLength >= Math.floor(maxLength * 0.8);

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {CLARIFY_MESSAGES.QUESTION_LABEL(questionNumber)}
            </p>
            {question.category ? (
              <Badge aria-hidden="true" variant="secondary">
                {CLARIFY_CATEGORY_LABELS[question.category]}
              </Badge>
            ) : null}
          </div>
          <label
            className="block text-base font-medium leading-normal text-card-foreground"
            htmlFor={`clarify-answer-${question.id}`}
          >
            {question.text}
          </label>
        </div>

        <Textarea
          aria-label={CLARIFY_MESSAGES.ANSWER_LABEL(questionNumber)}
          id={`clarify-answer-${question.id}`}
          placeholder={question.example ?? CLARIFY_MESSAGES.ANSWER_PLACEHOLDER}
          rows={3}
          {...registration}
        />

        <div className="flex min-h-5 items-center justify-between gap-4 text-sm">
          {error ? <p className="text-destructive">{error}</p> : <span />}
          {showCounter ? (
            <p className="ml-auto text-muted-foreground">
              {CLARIFY_MESSAGES.ANSWER_COUNTER(answerLength, maxLength)}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
