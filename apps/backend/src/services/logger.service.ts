import pino from "pino";
import pretty from "pino-pretty";
import { type AppConfig } from "../config/env";

class LoggerService {
  private static instance: LoggerService;
  private pinoLogger: pino.Logger;
  private isInitialized = false;

  private constructor() {
    // Initial safe state: assume production JSON logging to avoid performance hits or unparseable logs
    this.pinoLogger = pino({ level: "info" });
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Reconfigures the logger with the actual application configuration.
   * This should be called by the logging middleware as soon as the context is available.
   */
  init(config: AppConfig) {
    if (this.isInitialized) return;

    const isProduction = config.isProduction;
    const level = config.logLevel || "info";

    const stream = isProduction
      ? undefined
      : pretty({
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        });

    this.pinoLogger = isProduction ? pino({ level }) : pino({ level }, stream!);

    this.isInitialized = true;
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.pinoLogger.debug(context || {}, message);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.pinoLogger.info(context || {}, message);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.pinoLogger.warn(context || {}, message);
  }

  error(message: string, error: Error | unknown, context?: Record<string, unknown>) {
    this.pinoLogger.error({ err: error, ...context }, message);
  }
}

export const logger = LoggerService.getInstance();
