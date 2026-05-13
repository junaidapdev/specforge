import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type BriefSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function BriefSection({ title, icon: Icon, children }: BriefSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
