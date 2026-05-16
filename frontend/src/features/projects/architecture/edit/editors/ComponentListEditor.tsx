import { Button } from '@/components/ui/button';
import type { ArchitectureComponent } from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';
import { ComponentCardEditor } from './ComponentCardEditor';

type ComponentListEditorProps = {
  value: ArchitectureComponent[];
  onChange: (value: ArchitectureComponent[]) => void;
  disabled?: boolean;
};

function moveComponent(
  components: ArchitectureComponent[],
  from: number,
  to: number,
): ArchitectureComponent[] {
  const next = [...components];
  const [component] = next.splice(from, 1);
  if (!component) return components;
  next.splice(to, 0, component);
  return next;
}

function createComponent(): ArchitectureComponent {
  return {
    id: globalThis.crypto.randomUUID(),
    name: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_COMPONENT_NAME,
    description: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_COMPONENT_DESCRIPTION,
    responsibilities: [ARCHITECTURE_EDIT_MESSAGES.DEFAULT_COMPONENT_RESPONSIBILITY],
  };
}

export function ComponentListEditor({
  value,
  onChange,
  disabled = false,
}: ComponentListEditorProps) {
  return (
    <div className="space-y-4">
      {value.map((component, index) => (
        <ComponentCardEditor
          key={component.id}
          component={component}
          index={index}
          disabled={disabled}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onMoveUp={() => {
            onChange(moveComponent(value, index, index - 1));
          }}
          onMoveDown={() => {
            onChange(moveComponent(value, index, index + 1));
          }}
          onRemove={() => {
            onChange(value.filter((item) => item.id !== component.id));
          }}
          onChange={(nextComponent) => {
            onChange(value.map((item) => (item.id === component.id ? nextComponent : item)));
          }}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          onChange([...value, createComponent()]);
        }}
      >
        {ARCHITECTURE_EDIT_MESSAGES.ADD_COMPONENT_BUTTON}
      </Button>
    </div>
  );
}
