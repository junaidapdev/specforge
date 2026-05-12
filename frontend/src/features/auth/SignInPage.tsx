import { AlertCircle, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';

import { GoogleSignInButton } from './GoogleSignInButton';
import { getAuthErrorMessage, AUTH_MESSAGES } from './messages';
import { getFieldErrors, SignInSchema, type AuthFieldErrors, type SignInInput } from './schemas';
import { useAuth } from './useAuth';

const SIGN_IN_FIELDS = ['email', 'password'] as const;

type SignInField = (typeof SIGN_IN_FIELDS)[number];

function getRedirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return ROUTES.DASHBOARD;
  }

  const from = state.from;
  return typeof from === 'string' && from.startsWith('/') ? from : ROUTES.DASHBOARD;
}

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, session, signInWithPassword } = useAuth();
  const [values, setValues] = useState<SignInInput>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors<SignInField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <AuthCardSkeleton />;
  }

  if (session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const parsed = SignInSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues, SIGN_IN_FIELDS));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const { error } = await signInWithPassword(parsed.data.email, parsed.data.password);
    setIsSubmitting(false);

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    navigate(getRedirectPath(location.state), { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{AUTH_MESSAGES.SIGN_IN_TITLE}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.SIGN_IN_SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <GoogleSignInButton onError={setFormError} />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">{AUTH_MESSAGES.OR_DIVIDER}</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="sign-in-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
              <Input
                autoComplete="email"
                disabled={isSubmitting}
                id="sign-in-email"
                inputMode="email"
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues((current) => ({ ...current, email: event.target.value }))
                }
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sign-in-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
              <Input
                autoComplete="current-password"
                disabled={isSubmitting}
                id="sign-in-password"
                type="password"
                value={values.password}
                onChange={(event) =>
                  setValues((current) => ({ ...current, password: event.target.value }))
                }
              />
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              ) : null}
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {AUTH_MESSAGES.SIGN_IN_BUTTON}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-2 text-sm text-muted-foreground">
          <span>{AUTH_MESSAGES.TO_SIGN_UP}</span>
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            to={ROUTES.SIGN_UP}
          >
            {AUTH_MESSAGES.TO_SIGN_UP_LINK}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

function AuthCardSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </main>
  );
}
