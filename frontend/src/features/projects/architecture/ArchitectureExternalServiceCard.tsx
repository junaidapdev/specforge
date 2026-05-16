import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ArchitectureExternalService } from '@shared/schemas/architecture';

type ArchitectureExternalServiceCardProps = {
  service: ArchitectureExternalService;
};

export function ArchitectureExternalServiceCard({
  service,
}: ArchitectureExternalServiceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-base font-medium leading-snug">{service.name}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{service.purpose}</p>
        {service.notes ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{service.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
