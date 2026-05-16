import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PrdUserStory } from '@shared/schemas/prd';

import { PRD_EDIT_MESSAGES } from '../messages';
import { ReorderControls } from './ReorderControls';
import { StringListEditor } from './StringListEditor';

type UserStoryCardEditorProps = {
  story: PrdUserStory;
  index: number;
  onChange: (story: PrdUserStory) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
};

export function UserStoryCardEditor({
  story,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: UserStoryCardEditorProps) {
  const personaId = `prd-story-${index}-persona`;
  const storyId = `prd-story-${index}-story`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor={personaId}>{PRD_EDIT_MESSAGES.FIELD_USER_STORY_PERSONA}</Label>
          <Input
            id={personaId}
            value={story.persona}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...story, persona: event.target.value });
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
          <Label htmlFor={storyId}>{PRD_EDIT_MESSAGES.FIELD_USER_STORY_STORY}</Label>
          <Textarea
            id={storyId}
            value={story.story}
            rows={4}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...story, story: event.target.value });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>{PRD_EDIT_MESSAGES.FIELD_ACCEPTANCE_CRITERIA}</Label>
          <StringListEditor
            value={story.acceptance_criteria}
            disabled={disabled}
            onChange={(acceptanceCriteria) => {
              onChange({ ...story, acceptance_criteria: acceptanceCriteria });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
