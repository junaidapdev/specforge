import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReorderControls } from '@/features/projects/_shared/edit/editors/ReorderControls';
import type { ArchitectureExternalService } from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';

type ExternalServiceCardEditorProps = {
  service: ArchitectureExternalService;
  index: number;
  onChange: (service: ArchitectureExternalService) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
};

export function ExternalServiceCardEditor({
  service,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: ExternalServiceCardEditorProps) {
  const nameId = `architecture-service-${index}-name`;
  const purposeId = `architecture-service-${index}-purpose`;
  const notesId = `architecture-service-${index}-notes`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor={nameId}>{ARCHITECTURE_EDIT_MESSAGES.FIELD_SERVICE_NAME}</Label>
          <Input
            id={nameId}
            value={service.name}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...service, name: event.target.value });
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
          <Label htmlFor={purposeId}>{ARCHITECTURE_EDIT_MESSAGES.FIELD_SERVICE_PURPOSE}</Label>
          <Textarea
            id={purposeId}
            value={service.purpose}
            rows={4}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...service, purpose: event.target.value });
            }}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={notesId}>{ARCHITECTURE_EDIT_MESSAGES.FIELD_SERVICE_NOTES}</Label>
          <Textarea
            id={notesId}
            value={service.notes ?? ''}
            rows={3}
            disabled={disabled}
            onChange={(event) => {
              onChange({
                ...service,
                notes: event.target.value.length > 0 ? event.target.value : undefined,
              });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
