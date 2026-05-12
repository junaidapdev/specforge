import { useCallback, useState } from 'react';

import { logger } from '@/lib/logger';

const SIDEBAR_STORAGE_KEY = 'specforge.sidebar.collapsed';

function readStoredSidebarState(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    logger.warn('sidebar_state_read_failed');
    return false;
  }
}

export function useSidebarState(): readonly [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsedState] = useState<boolean>(() => readStoredSidebarState());

  const setCollapsed = useCallback((nextCollapsed: boolean): void => {
    setCollapsedState(nextCollapsed);

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));
    } catch {
      logger.warn('sidebar_state_write_failed');
    }
  }, []);

  return [collapsed, setCollapsed] as const;
}
