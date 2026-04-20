import pino from "pino";
import pretty from "pino-pretty";

/**
 * Logger Service
 * Centralized logging for the backend application using Pino.
 * Complies with the project's centralized observability standard.
 */
const isProduction = process.env.NODE_ENV === "production";

const stream = isProduction
  ? undefined
  : pretty({
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    });

const pinoLogger = isProduction
  ? pino({
      level: process.env.LOG_LEVEL || "info",
    })
  : pino({ level: process.env.LOG_LEVEL || "info" }, stream!);

export type LogLevel = "debug" | "info" | "warn" | "error";

class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  debug(message: string, context?: Record<string, unknown>) {
    pinoLogger.debug(context || {}, message);
  }

  info(message: string, context?: Record<string, unknown>) {
    pinoLogger.info(context || {}, message);
  }

  warn(message: string, context?: Record<string, unknown>) {
    pinoLogger.warn(context || {}, message);
  }

  error(message: string, error: Error | unknown, context?: Record<string, unknown>) {
    pinoLogger.error({ err: error, ...context }, message);
  }
}

export const logger = LoggerService.getInstance();
