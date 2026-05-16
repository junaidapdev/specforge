import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ReorderControls } from '@/features/projects/_shared/edit/editors/ReorderControls';
import {
  PrdFeaturePrioritySchema,
  type PrdFeature,
  type PrdFeaturePriority,
} from '@shared/schemas/prd';

import { PRD_MESSAGES } from '../../messages';
import { PRD_EDIT_MESSAGES } from '../messages';

type FeatureCardEditorProps = {
  feature: PrdFeature;
  index: number;
  onChange: (feature: PrdFeature) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
};

const PRIORITIES: readonly PrdFeaturePriority[] = [
  'must_have',
  'should_have',
  'nice_to_have',
];

export function FeatureCardEditor({
  feature,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: FeatureCardEditorProps) {
  const nameId = `prd-feature-${index}-name`;
  const descriptionId = `prd-feature-${index}-description`;
  const priorityId = `prd-feature-${index}-priority`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Label htmlFor={nameId}>{PRD_EDIT_MESSAGES.FIELD_FEATURE_NAME}</Label>
          <Input
            id={nameId}
            value={feature.name}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...feature, name: event.target.value });
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <ReorderControls
            disabled={disabled}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {PRD_EDIT_MESSAGES.REMOVE_BUTTON}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor={descriptionId}>{PRD_EDIT_MESSAGES.FIELD_FEATURE_DESCRIPTION}</Label>
          <Textarea
            id={descriptionId}
            value={feature.description}
            disabled={disabled}
            rows={4}
            onChange={(event) => {
              onChange({ ...feature, description: event.target.value });
            }}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={priorityId}>{PRD_EDIT_MESSAGES.FIELD_FEATURE_PRIORITY}</Label>
          <Select
            value={feature.priority}
            disabled={disabled}
            onValueChange={(value) => {
              const parsed = PrdFeaturePrioritySchema.safeParse(value);
              if (parsed.success) {
                onChange({ ...feature, priority: parsed.data });
              }
            }}
          >
            <SelectTrigger id={priorityId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRD_MESSAGES.PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
