import type { ReactNode } from 'react';

type ArchitectureSectionProps = {
  title: string;
  id?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ArchitectureSection({ title, id, actions, children }: ArchitectureSectionProps) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {actions}
      </div>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
