import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReorderControls } from '@/features/projects/_shared/edit/editors/ReorderControls';
import { StringListEditor } from '@/features/projects/_shared/edit/editors/StringListEditor';
import type { ArchitectureComponent } from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';

type ComponentCardEditorProps = {
  component: ArchitectureComponent;
  index: number;
  onChange: (component: ArchitectureComponent) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
};

export function ComponentCardEditor({
  component,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: ComponentCardEditorProps) {
  const nameId = `architecture-component-${index}-name`;
  const descriptionId = `architecture-component-${index}-description`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor={nameId}>{ARCHITECTURE_EDIT_MESSAGES.FIELD_COMPONENT_NAME}</Label>
          <Input
            id={nameId}
            value={component.name}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...component, name: event.target.value });
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
            {ARCHITECTURE_EDIT_MESSAGES.REMOVE_BUTTON}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor={descriptionId}>
            {ARCHITECTURE_EDIT_MESSAGES.FIELD_COMPONENT_DESCRIPTION}
          </Label>
          <Textarea
            id={descriptionId}
            value={component.description}
            rows={4}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...component, description: event.target.value });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.FIELD_COMPONENT_RESPONSIBILITIES}</Label>
          <StringListEditor
            value={component.responsibilities}
            disabled={disabled}
            onChange={(responsibilities) => {
              onChange({ ...component, responsibilities });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
