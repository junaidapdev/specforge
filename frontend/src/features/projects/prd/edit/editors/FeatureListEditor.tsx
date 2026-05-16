import { Button } from '@/components/ui/button';
import type { PrdFeature } from '@shared/schemas/prd';

import { PRD_EDIT_MESSAGES } from '../messages';
import { FeatureCardEditor } from './FeatureCardEditor';

type FeatureListEditorProps = {
  value: PrdFeature[];
  onChange: (value: PrdFeature[]) => void;
  disabled?: boolean;
};

function moveFeature(features: PrdFeature[], from: number, to: number): PrdFeature[] {
  const next = [...features];
  const [feature] = next.splice(from, 1);
  if (!feature) return features;
  next.splice(to, 0, feature);
  return next;
}

function createFeature(): PrdFeature {
  return {
    id: globalThis.crypto.randomUUID(),
    name: PRD_EDIT_MESSAGES.DEFAULT_FEATURE_NAME,
    description: PRD_EDIT_MESSAGES.DEFAULT_FEATURE_DESCRIPTION,
    priority: 'should_have',
  };
}

export function FeatureListEditor({
  value,
  onChange,
  disabled = false,
}: FeatureListEditorProps) {
  return (
    <div className="space-y-4">
      {value.map((feature, index) => (
        <FeatureCardEditor
          key={feature.id}
          feature={feature}
          index={index}
          disabled={disabled}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onMoveUp={() => {
            onChange(moveFeature(value, index, index - 1));
          }}
          onMoveDown={() => {
            onChange(moveFeature(value, index, index + 1));
          }}
          onRemove={() => {
            onChange(value.filter((item) => item.id !== feature.id));
          }}
          onChange={(nextFeature) => {
            onChange(value.map((item) => (item.id === feature.id ? nextFeature : item)));
          }}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          onChange([...value, createFeature()]);
        }}
      >
        {PRD_EDIT_MESSAGES.ADD_FEATURE_BUTTON}
      </Button>
    </div>
  );
}
