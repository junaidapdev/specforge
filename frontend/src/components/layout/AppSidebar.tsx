import { ChevronLeft, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useMatch } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

import { GLOBAL_NAV, PROJECT_NAV } from './nav-config';
import { SidebarNavItem } from './SidebarNavItem';

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onMobileOpenChange: (open: boolean) => void;
};

type SidebarContentProps = {
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
};

function SidebarContent({ collapsed, onCollapsedChange, onNavigate }: SidebarContentProps) {
  const projectMatch = useMatch(ROUTES.PROJECT_WORKSPACE);
  const projectId = projectMatch?.params.id;
  const isProjectMode = Boolean(projectId);
  const navItems = isProjectMode ? PROJECT_NAV : GLOBAL_NAV;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="flex h-14 items-center gap-2 px-3">
        <Link
          aria-label="Go to dashboard"
          className={cn(
            'flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            collapsed && 'justify-center px-0',
          )}
          to={ROUTES.DASHBOARD}
          onClick={onNavigate}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            SF
          </span>
          {!collapsed ? <span className="truncate">SpecForge</span> : null}
        </Link>

        {onCollapsedChange ? (
          <Button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto hidden md:inline-flex"
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => {
              onCollapsedChange(!collapsed);
            }}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </div>

      <Separator />

      <nav
        aria-label={isProjectMode ? 'Project navigation' : 'Global navigation'}
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            collapsed={collapsed}
            item={item}
            projectId={projectId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {isProjectMode ? (
        <>
          <Separator />
          <div className="p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  aria-label={collapsed ? 'Back to projects' : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    collapsed && 'justify-center px-0',
                  )}
                  to={ROUTES.DASHBOARD}
                  onClick={onNavigate}
                >
                  {collapsed ? (
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Back to projects</span>
                    </>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed ? <TooltipContent side="right">Back to projects</TooltipContent> : null}
            </Tooltip>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onCollapsedChange,
  onMobileOpenChange,
}: AppSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 md:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent className="w-80 p-0" side="left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Primary SpecForge navigation</SheetDescription>
          <SidebarContent
            collapsed={false}
            onNavigate={() => {
              onMobileOpenChange(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
