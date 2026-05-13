import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { UserMenu } from './UserMenu';

type AppHeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function AppHeader({ onOpenMobileSidebar }: AppHeaderProps) {
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

      <div className="min-w-0 flex-1" />

      <UserMenu />
    </header>
  );
}
