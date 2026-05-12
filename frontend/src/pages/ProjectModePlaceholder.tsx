import { useParams } from 'react-router-dom';

export function ProjectModePlaceholder() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      {/* TODO(chunk-11): remove this stub when real project layout lands. */}
      <h1 className="text-2xl font-semibold text-foreground">Project workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Project-scoped pages for {id ?? 'this project'} activate in later chunks.
      </p>
    </div>
  );
}
