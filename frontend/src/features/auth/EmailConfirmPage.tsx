import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

import { AUTH_MESSAGES } from './messages';
import { useAuth } from './useAuth';

export function EmailConfirmPage() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      const redirectId = window.setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 1_500);

      return () => {
        window.clearTimeout(redirectId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, 5_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading, navigate, session]);

  if (!loading && session) {
    return (
      <ConfirmStatusPage
        description="Taking you to the dashboard."
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />}
        title={AUTH_MESSAGES.CONFIRM_SUCCESS}
      />
    );
  }

  if (!timedOut) {
    return (
      <ConfirmStatusPage
        description="This should only take a moment."
        icon={<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />}
        title="Confirming your email"
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{AUTH_MESSAGES.CONFIRM_FAILED}</CardTitle>
          <CardDescription>Use the sign-in page to request a fresh session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email confirmation failed</AlertTitle>
            <AlertDescription>{AUTH_MESSAGES.CONFIRM_FAILED}</AlertDescription>
          </Alert>
          <Button asChild className="w-full" variant="outline">
            <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.TO_SIGN_IN_LINK}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

type ConfirmStatusPageProps = {
  description: string;
  icon: ReactNode;
  title: string;
};

function ConfirmStatusPage({ description, icon, title }: ConfirmStatusPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
