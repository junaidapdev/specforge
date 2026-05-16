import { formatRelativeTime } from '@/lib/relative-time';

import { ARCHITECTURE_MESSAGES } from './messages';
import { ArchitectureActions } from './ArchitectureActions';
import { ArchitectureComponentCard } from './ArchitectureComponentCard';
import { ArchitectureDecisionCard } from './ArchitectureDecisionCard';
import { ArchitectureExternalServiceCard } from './ArchitectureExternalServiceCard';
import { ArchitectureSection } from './ArchitectureSection';
import type { ArchitectureRow } from './useExistingArchitecture';

type ArchitectureViewProps = {
  architecture: ArchitectureRow;
  projectId: string;
};

function renderStringList(items: string[]) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-2">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

export function ArchitectureView({ architecture, projectId }: ArchitectureViewProps) {
  const content = architecture.content_json;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {ARCHITECTURE_MESSAGES.PAGE_TITLE}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ARCHITECTURE_MESSAGES.PAGE_SUBTITLE}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              {ARCHITECTURE_MESSAGES.VERSION_LABEL(architecture.version)}
            </p>
            <p className="mt-0.5">
              {ARCHITECTURE_MESSAGES.LAST_UPDATED_PREFIX}{' '}
              {formatRelativeTime(architecture.updated_at)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_STACK_OVERVIEW}>
          <p>{content.stack_overview}</p>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_SYSTEM}>
          <p>{content.system_diagram_text}</p>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_COMPONENTS}>
          <div className="space-y-4">
            {content.components.map((component) => (
              <ArchitectureComponentCard key={component.id} component={component} />
            ))}
          </div>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_DATA_MODEL}>
          <p>{content.data_model}</p>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_EXTERNAL_SERVICES}>
          {content.external_services.length === 0 ? (
            <p className="text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>
          ) : (
            <div className="space-y-4">
              {content.external_services.map((service) => (
                <ArchitectureExternalServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_AUTH_SECURITY}>
          <p>{content.auth_and_security}</p>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_HOSTING}>
          <p>{content.hosting_and_deployment}</p>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_DECISIONS}>
          {content.decisions.length === 0 ? (
            <p className="text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>
          ) : (
            <div className="space-y-4">
              {content.decisions.map((decision) => (
                <ArchitectureDecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          )}
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_OPEN_QUESTIONS}>
          {renderStringList(content.open_questions)}
        </ArchitectureSection>
      </div>

      <ArchitectureActions architecture={architecture} projectId={projectId} />
    </div>
  );
}
