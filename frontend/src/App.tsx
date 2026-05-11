import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { EmailConfirmPage } from '@/features/auth/EmailConfirmPage';
import { OAuthCallbackPage } from '@/features/auth/OAuthCallbackPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { useAuth } from '@/features/auth/useAuth';
import { HomePage } from '@/pages/HomePage';

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
      <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
      <Route path={ROUTES.AUTH_CONFIRM} element={<EmailConfirmPage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <RequireAuth>
            <DashboardPlaceholder />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
            <p className="text-sm font-medium text-muted-foreground">404 — Page not found</p>
          </main>
        }
      />
    </Routes>
  );
}

function DashboardPlaceholder() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    navigate(ROUTES.SIGN_IN, { replace: true });
  }

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 shadow-sm">
        {/* TODO(chunk-07): replace with real dashboard. */}
        <h1 className="text-2xl font-semibold tracking-normal text-card-foreground">
          Dashboard placeholder — Chunk 07 will replace this.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Authentication is working. The real dashboard arrives in a later chunk.
        </p>
        <Button
          className="mt-6"
          disabled={isSigningOut}
          type="button"
          variant="outline"
          onClick={() => {
            void handleSignOut();
          }}
        >
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
    </main>
  );
}
