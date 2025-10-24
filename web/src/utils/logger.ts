/* Lightweight logger for the frontend that silences logs in production. */
export const logger = {
  error: (...args: unknown[]) => {
    // Vite exposes import.meta.env.DEV
    try {
      // @ts-expect-error - import.meta typing is only available in Vite runtime
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        console.error(...(args as any));
      }
    } catch {
      // fallback to console in case import.meta isn't available in some environments
       
      console.error(...(args as any));
    }
  },
  warn: (...args: unknown[]) => {
    try {
      // @ts-expect-error - import.meta typing is only available in Vite runtime
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        console.warn(...(args as any));
      }
    } catch {
       
      console.warn(...(args as any));
    }
  },
  info: (...args: unknown[]) => {
    try {
      // @ts-expect-error - import.meta typing is only available in Vite runtime
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        console.info(...(args as any));
      }
    } catch {
       
      console.info(...(args as any));
    }
  },
  debug: (...args: unknown[]) => {
    try {
      // @ts-expect-error - import.meta typing is only available in Vite runtime
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        console.debug(...(args as any));
      }
    } catch {
       
      console.debug(...(args as any));
    }
  },
};
