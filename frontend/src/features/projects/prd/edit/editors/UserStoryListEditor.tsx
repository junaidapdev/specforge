import { Button } from '@/components/ui/button';
import type { PrdUserStory } from '@shared/schemas/prd';

import { PRD_EDIT_MESSAGES } from '../messages';
import { UserStoryCardEditor } from './UserStoryCardEditor';

type UserStoryListEditorProps = {
  value: PrdUserStory[];
  onChange: (value: PrdUserStory[]) => void;
  disabled?: boolean;
};

function moveStory(stories: PrdUserStory[], from: number, to: number): PrdUserStory[] {
  const next = [...stories];
  const [story] = next.splice(from, 1);
  if (!story) return stories;
  next.splice(to, 0, story);
  return next;
}

function createStory(): PrdUserStory {
  return {
    id: globalThis.crypto.randomUUID(),
    persona: PRD_EDIT_MESSAGES.DEFAULT_USER_STORY_PERSONA,
    story: PRD_EDIT_MESSAGES.DEFAULT_USER_STORY_STORY,
    acceptance_criteria: [PRD_EDIT_MESSAGES.DEFAULT_ACCEPTANCE_CRITERION],
  };
}

export function UserStoryListEditor({
  value,
  onChange,
  disabled = false,
}: UserStoryListEditorProps) {
  return (
    <div className="space-y-4">
      {value.map((story, index) => (
        <UserStoryCardEditor
          key={story.id}
          story={story}
          index={index}
          disabled={disabled}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onMoveUp={() => {
            onChange(moveStory(value, index, index - 1));
          }}
          onMoveDown={() => {
            onChange(moveStory(value, index, index + 1));
          }}
          onRemove={() => {
            onChange(value.filter((item) => item.id !== story.id));
          }}
          onChange={(nextStory) => {
            onChange(value.map((item) => (item.id === story.id ? nextStory : item)));
          }}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          onChange([...value, createStory()]);
        }}
      >
        {PRD_EDIT_MESSAGES.ADD_USER_STORY_BUTTON}
      </Button>
    </div>
  );
}
