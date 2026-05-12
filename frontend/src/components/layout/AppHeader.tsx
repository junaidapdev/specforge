import { Menu } from 'lucide-react';
import { useMatch } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import { UserMenu } from './UserMenu';

type AppHeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function AppHeader({ onOpenMobileSidebar }: AppHeaderProps) {
  const projectMatch = useMatch(ROUTES.PROJECT_WORKSPACE);
  const projectId = projectMatch?.params.id;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        aria-label="Open navigation"
        className="md:hidden"
        size="icon"
        type="button"
        variant="ghost"
        onClick={onOpenMobileSidebar}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1">
        {projectId ? (
          <p className="truncate text-sm text-muted-foreground">
            Projects / {/* TODO(chunk-11): replace placeholder with real project name. */}
            <span className="font-medium text-foreground">{projectId}</span>
          </p>
        ) : null}
      </div>

      <UserMenu />
    </header>
  );
}
