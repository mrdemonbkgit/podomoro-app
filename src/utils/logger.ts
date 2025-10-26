/**
 * Production-safe logging utility
 * 
 * - Development: All logs visible
 * - Production: Only errors visible (debug/info/warn removed at runtime)
 * 
 * Benefits:
 * - Runtime environment checks (no build-time stripping of console.error)
 * - Sensitive data sanitization
 * - Consistent logging interface
 * - Easy to extend (add remote logging, analytics, etc.)
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Sanitize sensitive data before logging
 * Prevents accidental exposure of user IDs, tokens, etc.
 */
function sanitize(data: unknown): unknown {
  if (typeof data === 'string') {
    // Partially hide user IDs: "dEsc8qAJ...Z6fkzVX" -> "dEsc...kzVX"
    if (data.length > 20) {
      return data.replace(/^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/, '$1...$2');
    }
    return data;
  }
  if (Array.isArray(data)) {
    // Truncate large arrays
    return data.length > 5 ? `[${data.length} items]` : data.map(sanitize);
  }
  if (data && typeof data === 'object') {
    // Sanitize object properties
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitize(value);
    }
    return sanitized;
  }
  return data;
}

export const logger = {
  /**
   * Debug logs - for detailed debugging information
   * Only visible in development
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args.map(sanitize));
    }
  },
  
  /**
   * Info logs - for general information
   * Only visible in development
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args.map(sanitize));
    }
  },
  
  /**
   * Warning logs - for potential issues
   * Only visible in development
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  /**
   * Error logs - for actual errors
   * ALWAYS visible (production + development)
   * 
   * NOTE: This is the only log level that appears in production.
   * Use for actual errors that need monitoring.
   */
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  /**
   * Group logs - for organizing related logs
   * Only visible in development
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  
  /**
   * End group - closes a log group
   * Only visible in development
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};

