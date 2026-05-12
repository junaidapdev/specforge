import type { ReactNode } from 'react';
import { useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { useSidebarState } from './useSidebarState';

type AppShellProps = {
  children: ReactNode;
  /**
   * Pages may tune the shell's content width here. Use `max-w-3xl` for reading-heavy
   * pages and the default `max-w-6xl` for dashboards and workspace views.
   */
  containerClassName?: string;
};

export function AppShell({ children, containerClassName }: AppShellProps) {
  const [collapsed, setCollapsed] = useSidebarState();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen bg-background text-foreground">
        <a
          className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring"
          href="#main-content"
        >
          Skip to main content
        </a>
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapsedChange={setCollapsed}
          onMobileOpenChange={setMobileSidebarOpen}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            onOpenMobileSidebar={() => {
              setMobileSidebarOpen(true);
            }}
          />
          <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
            <div className={cn('mx-auto w-full max-w-6xl px-6 py-8', containerClassName)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
