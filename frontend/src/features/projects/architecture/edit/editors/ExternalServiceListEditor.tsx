import { Button } from '@/components/ui/button';
import type { ArchitectureExternalService } from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';
import { ExternalServiceCardEditor } from './ExternalServiceCardEditor';

type ExternalServiceListEditorProps = {
  value: ArchitectureExternalService[];
  onChange: (value: ArchitectureExternalService[]) => void;
  disabled?: boolean;
};

function moveService(
  services: ArchitectureExternalService[],
  from: number,
  to: number,
): ArchitectureExternalService[] {
  const next = [...services];
  const [service] = next.splice(from, 1);
  if (!service) return services;
  next.splice(to, 0, service);
  return next;
}

function createService(): ArchitectureExternalService {
  return {
    id: globalThis.crypto.randomUUID(),
    name: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_SERVICE_NAME,
    purpose: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_SERVICE_PURPOSE,
  };
}

export function ExternalServiceListEditor({
  value,
  onChange,
  disabled = false,
}: ExternalServiceListEditorProps) {
  return (
    <div className="space-y-4">
      {value.map((service, index) => (
        <ExternalServiceCardEditor
          key={service.id}
          service={service}
          index={index}
          disabled={disabled}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onMoveUp={() => {
            onChange(moveService(value, index, index - 1));
          }}
          onMoveDown={() => {
            onChange(moveService(value, index, index + 1));
          }}
          onRemove={() => {
            onChange(value.filter((item) => item.id !== service.id));
          }}
          onChange={(nextService) => {
            onChange(value.map((item) => (item.id === service.id ? nextService : item)));
          }}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          onChange([...value, createService()]);
        }}
      >
        {ARCHITECTURE_EDIT_MESSAGES.ADD_EXTERNAL_SERVICE_BUTTON}
      </Button>
    </div>
  );
}
