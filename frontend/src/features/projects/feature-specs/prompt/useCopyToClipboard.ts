import { useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';

type CopyState = 'idle' | 'busy' | 'done' | 'error';

export function useCopyToClipboard() {
  const [state, setState] = useState<CopyState>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function copy(text: string) {
    setState('busy');

    try {
      await window.navigator.clipboard.writeText(text);
      setState('done');
    } catch (error) {
      logger.error('clipboard_copy_failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
      setState('error');
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setState('idle');
    }, 2000);
  }

  return { state, copy };
}
