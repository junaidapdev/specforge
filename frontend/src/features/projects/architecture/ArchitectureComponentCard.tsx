import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ArchitectureComponent } from '@shared/schemas/architecture';

import { ARCHITECTURE_MESSAGES } from './messages';

type ArchitectureComponentCardProps = {
  component: ArchitectureComponent;
};

export function ArchitectureComponentCard({ component }: ArchitectureComponentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-base font-medium leading-snug">{component.name}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{component.description}</p>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {ARCHITECTURE_MESSAGES.COMPONENT_RESPONSIBILITIES}
          </p>
          <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed">
            {component.responsibilities.map((responsibility, index) => (
              <li key={`${index}-${responsibility}`}>{responsibility}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
