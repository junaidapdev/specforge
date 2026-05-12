import { NavLink } from 'react-router-dom';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { NavItem } from './nav-config';

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
  projectId?: string;
  onNavigate?: () => void;
};

function resolveNavPath(item: NavItem, projectId?: string): string {
  if (typeof item.to === 'string') {
    return item.to;
  }

  return item.to(projectId ?? '');
}

export function SidebarNavItem({ item, collapsed, projectId, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;
  const sharedClasses = cn(
    'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    collapsed && 'justify-center px-0',
  );

  if (item.pendingChunk) {
    const button = (
      <button
        aria-disabled="true"
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          sharedClasses,
          'cursor-not-allowed text-muted-foreground opacity-70 hover:bg-transparent',
        )}
        type="button"
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
      </button>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">Available in Chunk {item.pendingChunk}</TooltipContent>
      </Tooltip>
    );
  }

  const link = (
    <NavLink
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          sharedClasses,
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent font-medium text-accent-foreground',
        )
      }
      end={item.id === 'dashboard'}
      to={resolveNavPath(item, projectId)}
      onClick={onNavigate}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </NavLink>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
