import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ErrorFallbackProps = {
  onReset: () => void;
};

export function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h1 className="text-xl font-semibold text-card-foreground">Something went wrong.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            An unexpected error occurred. You can try again, or reload the page.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={onReset}>
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
