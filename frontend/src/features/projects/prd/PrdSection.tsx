import type { ReactNode } from 'react';

type PrdSectionProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function PrdSection({ title, children, actions }: PrdSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
