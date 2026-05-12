import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

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
import { getFieldErrors, SignUpSchema, type AuthFieldErrors, type SignUpInput } from './schemas';
import { useAuth } from './useAuth';

const SIGN_UP_FIELDS = ['displayName', 'email', 'password'] as const;

type SignUpField = (typeof SIGN_UP_FIELDS)[number];

export function SignUpPage() {
  const { loading, session, signUpWithPassword } = useAuth();
  const [values, setValues] = useState<SignUpInput>({
    displayName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors<SignUpField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (loading) {
    return <SignUpCardSkeleton />;
  }

  if (session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const parsed = SignUpSchema.safeParse({
      ...values,
      displayName: values.displayName?.trim() ? values.displayName : undefined,
    });

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error.issues, SIGN_UP_FIELDS));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const { error } = await signUpWithPassword(
      parsed.data.email,
      parsed.data.password,
      parsed.data.displayName,
    );
    setIsSubmitting(false);

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    setEmailSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        {emailSent ? (
          <>
            <CardHeader className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" aria-hidden="true" />
              <CardTitle>{AUTH_MESSAGES.EMAIL_SENT_TITLE}</CardTitle>
              <CardDescription>{AUTH_MESSAGES.EMAIL_SENT_BODY}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button asChild variant="outline">
                <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.TO_SIGN_IN_LINK}</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle>{AUTH_MESSAGES.SIGN_UP_TITLE}</CardTitle>
              <CardDescription>{AUTH_MESSAGES.SIGN_UP_SUBTITLE}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sign-up failed</AlertTitle>
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
                  <Label htmlFor="sign-up-name">{AUTH_MESSAGES.DISPLAY_NAME_LABEL}</Label>
                  <Input
                    autoComplete="name"
                    disabled={isSubmitting}
                    id="sign-up-name"
                    type="text"
                    value={values.displayName}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        displayName: event.target.value,
                      }))
                    }
                  />
                  {fieldErrors.displayName ? (
                    <p className="text-sm text-destructive">{fieldErrors.displayName}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sign-up-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
                  <Input
                    autoComplete="email"
                    disabled={isSubmitting}
                    id="sign-up-email"
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
                  <Label htmlFor="sign-up-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
                  <Input
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    id="sign-up-password"
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
                  {AUTH_MESSAGES.SIGN_UP_BUTTON}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center gap-2 text-sm text-muted-foreground">
              <span>{AUTH_MESSAGES.TO_SIGN_IN}</span>
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                to={ROUTES.SIGN_IN}
              >
                {AUTH_MESSAGES.TO_SIGN_IN_LINK}
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </main>
  );
}

function SignUpCardSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto h-7 w-56 animate-pulse rounded bg-muted" />
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
