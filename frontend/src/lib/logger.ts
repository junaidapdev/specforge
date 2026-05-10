/* eslint-disable no-console */

/**
 * Sensitive data (tokens, passwords, full user objects, API responses with secrets)
 * must never be passed to the logger.
 */
import { IS_PRODUCTION } from '@/config/env';

export const logger = Object.freeze({
  debug: (...args: unknown[]): void => {
    if (!IS_PRODUCTION) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (!IS_PRODUCTION) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
});
