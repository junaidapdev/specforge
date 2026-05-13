import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';
import { NotFoundPage } from '@/components/layout/NotFoundPage';
import { ROUTES } from '@/constants/routes';
import { EmailConfirmPage } from '@/features/auth/EmailConfirmPage';
import { OAuthCallbackPage } from '@/features/auth/OAuthCallbackPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { useAuth } from '@/features/auth/useAuth';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ClarifyPage } from '@/features/projects/clarify/ClarifyPage';
import { NewProjectPage } from '@/features/projects/new/NewProjectPage';
import { ProjectModePlaceholder } from '@/pages/ProjectModePlaceholder';
import { HomePage } from '@/pages/HomePage';

const DevRoutesPage = __SPECFORGE_DEV_ROUTES__
  ? lazy(() =>
      import('@/pages/DevRoutesPage').then((module) => ({ default: module.DevRoutesPage })),
    )
  : null;
const DEV_ROUTES_PATH = __SPECFORGE_DEV_ROUTES__ ? '/dev/routes' : null;

export function App() {
  const { loading } = useAuth();

  return (
    <ErrorBoundary>
      {loading ? (
        <FullScreenLoader />
      ) : (
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
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.PROJECT_NEW}
            element={
              <RequireAuth>
                <AppShell containerClassName="max-w-3xl">
                  <NewProjectPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.PROJECT_CLARIFY(':id')}
            element={
              <RequireAuth>
                <AppShell>
                  <ClarifyPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.PROJECT_WORKSPACE}
            element={
              <RequireAuth>
                <AppShell>
                  <ProjectModePlaceholder />
                </AppShell>
              </RequireAuth>
            }
          />
          {DevRoutesPage && DEV_ROUTES_PATH ? (
            <Route
              path={DEV_ROUTES_PATH}
              element={
                <RequireAuth>
                  <AppShell>
                    <Suspense fallback={<FullScreenLoader />}>
                      <DevRoutesPage />
                    </Suspense>
                  </AppShell>
                </RequireAuth>
              }
            />
          ) : null}
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      )}
    </ErrorBoundary>
  );
}

function NotFoundRoute() {
  const { session } = useAuth();

  if (session) {
    return (
      <AppShell>
        <NotFoundPage variant="signedIn" />
      </AppShell>
    );
  }

  return <NotFoundPage variant="signedOut" />;
}
