import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type NotFoundPageProps = {
  variant: 'signedIn' | 'signedOut';
};

export function NotFoundPage({ variant }: NotFoundPageProps) {
  const isSignedIn = variant === 'signedIn';

  return (
    <div
      className={cn(
        'flex items-center justify-center px-4 text-foreground',
        isSignedIn ? 'min-h-[60vh]' : 'min-h-screen bg-background py-10',
      )}
    >
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold text-card-foreground">Page not found.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We could not find the page you were looking for.
          </p>
          <Button asChild className="mt-6">
            <Link to={isSignedIn ? ROUTES.DASHBOARD : ROUTES.HOME}>
              {isSignedIn ? 'Go to dashboard' : 'Go home'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
