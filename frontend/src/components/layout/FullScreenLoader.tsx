import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FullScreenLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-8">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto h-8 w-44" />
          <Skeleton className="mx-auto h-4 w-64 max-w-full" />
          <Skeleton className="mx-auto h-10 w-32" />
        </CardContent>
      </Card>
    </main>
  );
}
