/**
 * Logger Service
 * Centralized logging for the mobile application.
 * Handles formatting, environment-specific transports, and error destructuring.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
  timestamp: string;
}

class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Destructures Error objects to capture non-enumerable properties like message and stack.
   */
  private formatError(error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        // Any other common custom error fields can be added here
      };
    }
    return error;
  }

  private log(entry: Omit<LogEntry, "timestamp"> & { timestamp?: string }) {
    const timestamp = entry.timestamp || new Date().toISOString();
    const { level, message, context, error } = entry;
    const formattedError = error ? this.formatError(error) : undefined;

    // 1. Development Transport (Console)
    if (__DEV__) {
      const emoji = {
        debug: "🔍",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
      }[level];

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, {
        timestamp,
        ...(context || {}),
        ...(formattedError ? { error: formattedError } : {}),
      });
    }

    // 2. Production Transport (e.g., Sentry, Bugsnag)
    if (!__DEV__) {
      // TODO: Integrate Sentry or other remote logging service
      // Sentry.captureException(error, { extra: { message, context, timestamp } });
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log({ level: "debug", message, context });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log({ level: "info", message, context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log({ level: "warn", message, context });
  }

  error(message: string, error: unknown, context?: Record<string, unknown>) {
    this.log({
      level: "error",
      message,
      error,
      context,
    });
  }
}

export const logger = LoggerService.getInstance();
