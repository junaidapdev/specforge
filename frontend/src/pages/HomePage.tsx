import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">coming soon</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-card-foreground">
          SpecForge
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">SpecForge — coming soon.</p>
        <Button className="mt-6" type="button" onClick={() => logger.info('button clicked')}>
          Hello shadcn
        </Button>
      </section>
    </main>
  );
}
