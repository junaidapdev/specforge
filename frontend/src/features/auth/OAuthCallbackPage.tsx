import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

import { AUTH_MESSAGES } from './messages';
import { useAuth } from './useAuth';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, 5_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading, navigate, session]);

  if (!timedOut) {
    return (
      <AuthStatusPage title={AUTH_MESSAGES.OAUTH_PROCESSING}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </AuthStatusPage>
    );
  }

  return (
    <AuthStatusPage title={AUTH_MESSAGES.OAUTH_FAILED}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sign-in failed</AlertTitle>
        <AlertDescription>{AUTH_MESSAGES.OAUTH_FAILED}</AlertDescription>
      </Alert>
      <Button asChild className="mt-4" variant="outline">
        <Link to={ROUTES.SIGN_IN}>Try again</Link>
      </Button>
    </AuthStatusPage>
  );
}

type AuthStatusPageProps = {
  title: string;
  children: ReactNode;
};

function AuthStatusPage({ title, children }: AuthStatusPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">{children}</CardContent>
      </Card>
    </main>
  );
}
