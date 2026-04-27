/**
 * Logger Service
 * Centralized logging for the mobile application.
 * Handles formatting, environment-specific transports, and error destructuring.
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
  timestamp?: string;
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
      const formatted: Record<string, unknown> = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      };

      // Capture any other custom properties (e.g. code, status, etc.)
      Object.getOwnPropertyNames(error).forEach((key) => {
        if (!(key in formatted)) {
          formatted[key] = (error as unknown as Record<string, unknown>)[key];
        }
      });

      return formatted;
    }
    return error;
  }

  private log(entry: Omit<LogEntry, "timestamp"> & { timestamp?: string }) {
    const timestamp = entry.timestamp || new Date().toISOString();
    const { level, message, context, error } = entry;
    const formattedError = error ? this.formatError(error) : undefined;

    // 1. Development Transport (Console)
    if (__DEV__) {
      const emoji: Record<LogLevel, string> = {
        DEBUG: "🔍",
        INFO: "ℹ️",
        WARN: "⚠️",
        ERROR: "❌",
      };

      const consoleTransport = globalThis.console;
      consoleTransport.info(`${emoji[level]} [${level}] ${message}`, {
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
    this.log({ level: "DEBUG", message, context });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log({ level: "INFO", message, context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log({ level: "WARN", message, context });
  }

  error(message: string, error: unknown, context?: Record<string, unknown>) {
    this.log({
      level: "ERROR",
      message,
      error,
      context,
    });
  }
}

export const logger = LoggerService.getInstance();
