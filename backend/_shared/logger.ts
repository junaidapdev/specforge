// deno-lint-ignore-file no-console

/**
 * Sensitive data (tokens, API keys, full request bodies, full user objects)
 * must never be passed to the logger.
 */
const environment = Deno.env.get('ENVIRONMENT') ?? 'development';
const isProduction = environment === 'production';

export const logger = Object.freeze({
  debug: (...args: unknown[]): void => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (!isProduction) {
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
