import { Textarea } from '@/components/ui/textarea';

type ProseEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ProseEditor({ value, onChange, disabled = false }: ProseEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      rows={7}
      className="font-mono text-sm leading-relaxed"
      disabled={disabled}
    />
  );
}
