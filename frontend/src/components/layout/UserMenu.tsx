import { LogOut, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';

function getMetadataString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getInitial(displayName: string | null, email: string | null): string {
  const source = displayName ?? email ?? 'SpecForge';
  return source.trim().charAt(0).toUpperCase() || 'S';
}

export function UserMenu() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const email = user?.email ?? null;
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const displayName = getMetadataString(metadata?.full_name) ?? getMetadataString(metadata?.name);

  const fallbackInitial = useMemo(() => getInitial(displayName, email), [displayName, email]);

  async function handleSignOut(): Promise<void> {
    await signOut();
    navigate(ROUTES.HOME, { replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open user menu"
          className="h-9 w-9 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {email ?? 'Signed in user'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              aria-disabled="true"
              className="cursor-not-allowed text-muted-foreground opacity-70"
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left">Available in Chunk 29</TooltipContent>
        </Tooltip>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void handleSignOut();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
