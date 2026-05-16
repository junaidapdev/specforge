import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useDirtyGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return useBlocker(({ currentLocation, nextLocation }) => {
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });
}
