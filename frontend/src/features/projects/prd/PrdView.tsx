import { formatRelativeTime } from '@/lib/relative-time';

import { PRD_MESSAGES } from './messages';
import { PrdActions } from './PrdActions';
import { PrdFeatureCard } from './PrdFeatureCard';
import { PrdSection } from './PrdSection';
import { PrdUserStoryCard } from './PrdUserStoryCard';
import type { PrdRow } from './useExistingPrd';

type PrdViewProps = {
  prd: PrdRow;
  projectId: string;
};

function ProseSection({ text }: { text: string }) {
  return <p className="whitespace-pre-line">{text}</p>;
}

function ListSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-1.5">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

export function PrdView({ prd, projectId }: PrdViewProps) {
  const content = prd.content_json;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{PRD_MESSAGES.PAGE_TITLE}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{PRD_MESSAGES.PAGE_SUBTITLE}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{PRD_MESSAGES.VERSION_LABEL(prd.version)}</p>
            <p className="mt-0.5">
              {PRD_MESSAGES.LAST_UPDATED_PREFIX} {formatRelativeTime(prd.updated_at)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <PrdSection title={PRD_MESSAGES.SECTION_GOAL}>
          <ProseSection text={content.goal} />
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_TARGET_USERS}>
          <ListSection items={content.target_users} />
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_PROBLEM}>
          <ProseSection text={content.problem_statement} />
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_SUCCESS_CRITERIA}>
          <ListSection items={content.success_criteria} />
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_FEATURES}>
          <div className="grid grid-cols-1 gap-4">
            {content.features.map((feature) => (
              <PrdFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_USER_STORIES}>
          {content.user_stories.length > 0 ? (
            <div className="space-y-4">
              {content.user_stories.map((story) => (
                <PrdUserStoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>
          )}
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_OUT_OF_SCOPE}>
          <ListSection items={content.out_of_scope} />
        </PrdSection>

        <PrdSection title={PRD_MESSAGES.SECTION_OPEN_QUESTIONS}>
          <ListSection items={content.open_questions} />
        </PrdSection>
      </div>

      <PrdActions prd={prd} projectId={projectId} />
    </div>
  );
}
