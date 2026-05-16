import { CheckCircle2 } from 'lucide-react';

import { Alert, AlertTitle } from '@/components/ui/alert';

import { CONTEXT_FILES_MESSAGES } from './messages';

export function ContextDocApprovalBanner() {
  return (
    <Alert className="border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400">
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
      <AlertTitle>{CONTEXT_FILES_MESSAGES.APPROVED_BANNER}</AlertTitle>
    </Alert>
  );
}
