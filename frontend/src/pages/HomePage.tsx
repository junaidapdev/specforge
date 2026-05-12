import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';

export function HomePage() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-4 h-9 w-44 animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-4 h-4 w-64 animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-6 h-10 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          {session ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-card-foreground">
                SpecForge
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Continue planning your next shippable chunk.
              </p>
              <Button asChild className="mt-6">
                <Link to={ROUTES.DASHBOARD}>Go to dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">coming soon</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-card-foreground">
                SpecForge
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">SpecForge — coming soon.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link to={ROUTES.SIGN_IN}>Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={ROUTES.SIGN_UP}>Sign up</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
