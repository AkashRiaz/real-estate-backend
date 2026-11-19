import { isProduction } from "../config";

/**
 * Info logs are silenced in production; errors are always reported.
 */
export const logger = {
  info: (...args: unknown[]) => {
    if (!isProduction) console.info(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
