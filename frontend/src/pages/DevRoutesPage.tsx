import { GLOBAL_NAV, PROJECT_NAV } from '@/components/layout/nav-config';
import { ROUTES } from '@/constants/routes';

const SAMPLE_PROJECT_ID = 'project-id';

function routePath(to: string | ((projectId: string) => string)): string {
  return typeof to === 'string' ? to : to(SAMPLE_PROJECT_ID);
}

export function DevRoutesPage() {
  const routes = [
    { path: ROUTES.HOME, status: 'Public' },
    { path: ROUTES.SIGN_IN, status: 'Chunk 05' },
    { path: ROUTES.SIGN_UP, status: 'Chunk 05' },
    { path: ROUTES.AUTH_CALLBACK, status: 'Chunk 05' },
    { path: ROUTES.AUTH_CONFIRM, status: 'Chunk 05' },
    { path: ROUTES.PROJECT_NEW, status: 'Chunk 08' },
    ...GLOBAL_NAV.map((item) => ({
      path: routePath(item.to),
      status: item.pendingChunk ? `Chunk ${item.pendingChunk}` : 'Available',
    })),
    ...PROJECT_NAV.map((item) => ({
      path: routePath(item.to),
      status: item.pendingChunk ? `Chunk ${item.pendingChunk}` : 'Available',
    })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Route map</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Development-only route sanity check. Not shipped in production builds.
      </p>
      <div className="mt-6 overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={`${route.path}-${route.status}`} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{route.path}</td>
                <td className="px-4 py-3 text-muted-foreground">{route.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
