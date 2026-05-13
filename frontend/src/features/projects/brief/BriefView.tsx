import {
  AlertCircle,
  Ban,
  HelpCircle,
  Layers,
  ShieldAlert,
  Target,
  Users,
  Workflow,
} from 'lucide-react';

import { formatRelativeTime } from '@/lib/relative-time';
import type { ProjectBriefContent } from '@shared/schemas/brief';

import { BriefActions } from './BriefActions';
import { BriefSection } from './BriefSection';
import { BRIEF_MESSAGES } from './messages';
import type { BriefRow } from './useExistingBrief';

type BriefViewProps = {
  brief: BriefRow;
  projectId: string;
};

function ProseSection({ text }: { text: string }) {
  return <p className="whitespace-pre-line">{text}</p>;
}

function ListSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-1.5">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

type TechStack = NonNullable<ProjectBriefContent['initialTechStack']>;

function TechStackSection({ stack }: { stack: TechStack | undefined }) {
  if (!stack) {
    return <p className="text-sm text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  type Row = { label: string; value: string };
  const rows: Row[] = [];
  if (stack.frontend) {
    rows.push({ label: BRIEF_MESSAGES.TECH_LABEL_FRONTEND, value: stack.frontend });
  }
  if (stack.backend) {
    rows.push({ label: BRIEF_MESSAGES.TECH_LABEL_BACKEND, value: stack.backend });
  }
  if (stack.database) {
    rows.push({ label: BRIEF_MESSAGES.TECH_LABEL_DATABASE, value: stack.database });
  }
  if (stack.hosting) {
    rows.push({ label: BRIEF_MESSAGES.TECH_LABEL_HOSTING, value: stack.hosting });
  }
  if (stack.ai) {
    rows.push({ label: BRIEF_MESSAGES.TECH_LABEL_AI, value: stack.ai });
  }

  const otherItems = stack.other ?? [];
  const techAssumptions = stack.assumptions ?? [];

  if (rows.length === 0 && otherItems.length === 0 && techAssumptions.length === 0) {
    return <p className="text-sm text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <div className="space-y-4">
      {rows.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-sm font-medium text-muted-foreground">{row.label}</dt>
              <dd className="text-base text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {otherItems.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            {BRIEF_MESSAGES.TECH_LABEL_OTHER}
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            {otherItems.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {techAssumptions.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            {BRIEF_MESSAGES.TECH_LABEL_ASSUMPTIONS}
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            {techAssumptions.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function BriefView({ brief, projectId }: BriefViewProps) {
  const content = brief.content_json;
  const assumptions = content.assumptions ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{BRIEF_MESSAGES.PAGE_TITLE}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{BRIEF_MESSAGES.PAGE_SUBTITLE}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{BRIEF_MESSAGES.VERSION_LABEL(brief.version)}</p>
            <p className="mt-0.5">
              {BRIEF_MESSAGES.LAST_UPDATED_PREFIX} {formatRelativeTime(brief.updated_at)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <BriefSection title={BRIEF_MESSAGES.SECTION_PROBLEM} icon={AlertCircle}>
          <ProseSection text={content.problemStatement} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_USER} icon={Users}>
          <ProseSection text={content.targetUser} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_USE_CASE} icon={Workflow}>
          <ProseSection text={content.coreUseCase} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_MVP} icon={Target}>
          <ProseSection text={content.mvpGoal} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_OUT_OF_SCOPE} icon={Ban}>
          <ListSection items={content.outOfScope} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_RISKS} icon={ShieldAlert}>
          <ListSection items={content.keyRisks} />
        </BriefSection>

        <BriefSection title={BRIEF_MESSAGES.SECTION_TECH} icon={Layers}>
          <TechStackSection stack={content.initialTechStack} />
        </BriefSection>

        {assumptions.length > 0 ? (
          <BriefSection title={BRIEF_MESSAGES.SECTION_ASSUMPTIONS} icon={HelpCircle}>
            <ListSection items={assumptions} />
          </BriefSection>
        ) : null}
      </div>

      <BriefActions brief={brief} projectId={projectId} />
    </div>
  );
}
