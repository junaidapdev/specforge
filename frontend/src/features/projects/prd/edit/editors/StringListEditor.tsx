import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { PRD_EDIT_MESSAGES } from '../messages';
import { ReorderControls } from './ReorderControls';

type StringListEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  addLabel?: string;
};

function moveItem(items: string[], from: number, to: number): string[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

function moveKey(keys: string[], from: number, to: number): string[] {
  const next = [...keys];
  const [key] = next.splice(from, 1);
  if (key === undefined) return keys;
  next.splice(to, 0, key);
  return next;
}

export function StringListEditor({
  value,
  onChange,
  disabled = false,
  addLabel = PRD_EDIT_MESSAGES.ADD_ITEM_BUTTON,
}: StringListEditorProps) {
  const [itemKeys, setItemKeys] = useState<string[]>(() =>
    value.map(() => globalThis.crypto.randomUUID()),
  );

  return (
    <div className="space-y-3">
      {value.map((item, index) => {
        const inputId = `prd-list-item-${index}`;
        const itemKey = itemKeys[index] ?? `${inputId}-fallback`;

        return (
          <div
            key={itemKey}
            className="flex flex-col gap-2 rounded-md border bg-background p-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={inputId} className="sr-only">
                {PRD_EDIT_MESSAGES.FIELD_ITEM(index)}
              </Label>
              <Input
                id={inputId}
                value={item}
                disabled={disabled}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = event.target.value;
                  onChange(next);
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <ReorderControls
                disabled={disabled}
                canMoveUp={index > 0}
                canMoveDown={index < value.length - 1}
                onMoveUp={() => {
                  setItemKeys((current) => moveKey(current, index, index - 1));
                  onChange(moveItem(value, index, index - 1));
                }}
                onMoveDown={() => {
                  setItemKeys((current) => moveKey(current, index, index + 1));
                  onChange(moveItem(value, index, index + 1));
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setItemKeys((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  );
                  onChange(value.filter((_, itemIndex) => itemIndex !== index));
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {PRD_EDIT_MESSAGES.REMOVE_BUTTON}
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setItemKeys((current) => [...current, globalThis.crypto.randomUUID()]);
          onChange([...value, '']);
        }}
      >
        {addLabel}
      </Button>
    </div>
  );
}
