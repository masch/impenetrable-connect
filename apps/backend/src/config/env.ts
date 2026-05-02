import { Context } from "hono";
import { type Db } from "../db/factory";

/**
 * Valid Environments
 */
export type Environment = "development" | "production" | "test" | "preview" | "staging";

/**
 * Valid Log Levels (Pino standard)
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "silent";

/**
 * Hono Environment Interface
 * Declares the structure of variables and bindings injected by the platform.
 */
export interface AppEnv {
  Variables: {
    db: Db;
  };
  Bindings: {
    /** Primary database connection string (usually a pooled connection) */
    DATABASE_URL: string;
    /** Direct database connection string (bypasses proxies, required for migrations) */
    DIRECT_URL?: string;
    /** Current deployment environment identifier */
    ENVIRONMENT?: string;
    /** Comma-separated list of allowed CORS origins */
    ALLOWED_ORIGINS?: string;
    /** Secret key for JWT signing and verification (CRITICAL) */
    JWT_SECRET: string;
    /** Secret token required for authorized health check details */
    HEALTH_TOKEN?: string;
    /** GitHub repository (org/repo) for workflow integration */
    GITHUB_REPO?: string;
    /** GitHub token for API authentication */
    GITHUB_TOKEN?: string;
    /** Minimum logging level threshold */
    LOG_LEVEL?: string;
    /** Flag to enable/disable logging of request/response bodies ("true" or "false") */
    LOG_BODY?: string;
    /** Server listening port (for traditional server mode) */
    PORT?: string;
  };
}

/**
 * AppConfig Interface
 * Centralized schema for all application configuration.
 */
export interface AppConfig {
  /** Resolved JWT secret key used for authentication */
  jwtSecret: string;
  /** Resolved primary database connection string */
  databaseUrl: string;
  /** Resolved direct database connection string (falls back to databaseUrl) */
  directUrl: string;
  /** Normalized environment identifier (development, production, etc.) */
  environment: Environment;
  /** Resolved health check authorization token */
  healthToken: string;
  /** Parsed list of allowed CORS origins */
  allowedOrigins?: string[];
  /** GitHub repository path for health check tracking */
  githubRepo?: string;
  /** GitHub API token for health check tracking */
  githubToken?: string;
  /** Effective logging level based on environment and config */
  logLevel: LogLevel;
  /** Semantic flag to enable/disable body logging */
  logBody: boolean;
  /** Semantic flag: true if running in production environment */
  isProduction: boolean;
  /** Semantic flag: true if running in development environment */
  isDevelopment: boolean;
  /** Semantic flag: true if running inside a Cloudflare Worker context */
  isWorker: boolean;
  /** Final server port number */
  port: number;
}

/**
 * Architect Rule: Centralized environment resolver.
 * Handles the abstraction between Cloudflare Bindings and Process Env.
 * Can be called with a Context (request-time) or without (boot-time).
 */
export function getAppConfig(c?: Context<AppEnv>): AppConfig {
  // Architect Rule: Bindings (c.env) take priority over Process Env.
  // This is crucial for Cloudflare Workers and reliable Integration Tests.
  const bindings = (c?.env || {}) as AppEnv["Bindings"];
  const processEnv = (process.env || {}) as Record<string, string | undefined>;

  // Rationale for || "" (Deployment Patch):
  // During 'wrangler deploy' validation, Cloudflare executes the script without injecting bindings.
  // Without this fallback, the code would crash when trying to assign undefined to a property that the AppConfig interface requires as a string.
  const jwtSecret = bindings.JWT_SECRET || processEnv.JWT_SECRET || "";

  const isWorker =
    typeof (globalThis as unknown as Record<string, unknown>).WebSocketPair !== "undefined" ||
    !!(globalThis as unknown as Record<string, unknown>).caches;

  // Architect Rule: Fail-fast if critical secrets are missing.
  // Exception: During Worker boot-time (no context), bindings are not yet available.
  // We only throw if we have a context (request-time) or if we are not in a Worker environment (where process.env should have it).
  if (!jwtSecret && (c || !isWorker)) {
    throw new Error(
      "CRITICAL: JWT_SECRET is not defined in environment bindings or process variables.",
    );
  }

  const databaseUrl = bindings.DATABASE_URL || processEnv.DATABASE_URL || "";

  if (!databaseUrl && (c || !isWorker)) {
    throw new Error(
      "CRITICAL: DATABASE_URL is not defined in environment bindings or process variables.",
    );
  }

  const origins = bindings.ALLOWED_ORIGINS || processEnv.ALLOWED_ORIGINS;
  const environment = (bindings.ENVIRONMENT ||
    processEnv.ENVIRONMENT ||
    processEnv.NODE_ENV ||
    "development") as Environment;

  return {
    jwtSecret,
    databaseUrl,
    directUrl: bindings.DIRECT_URL || processEnv.DIRECT_URL || databaseUrl,
    environment,
    healthToken: bindings.HEALTH_TOKEN || processEnv.HEALTH_TOKEN || "",
    allowedOrigins: origins ? origins.split(",") : undefined,
    githubRepo: bindings.GITHUB_REPO || processEnv.GITHUB_REPO,
    githubToken: bindings.GITHUB_TOKEN || processEnv.GITHUB_TOKEN,
    logLevel: (bindings.LOG_LEVEL || processEnv.LOG_LEVEL || "info") as LogLevel,
    logBody: (bindings.LOG_BODY || processEnv.LOG_BODY) === "true",
    isProduction: environment === "production",
    isDevelopment: environment === "development",
    isWorker,
    port: Number(bindings.PORT || processEnv.PORT || 3000),
  };
}

/**
 * Architect Rule: Specialized resolver for CLI tools (Drizzle Kit, Seeders).
 * Does NOT require a Hono Context and avoids throwing on missing application secrets
 * that are irrelevant for database operations.
 */
export function getCLIConfig() {
  const processEnv = (process.env || {}) as Record<string, string | undefined>;
  const databaseUrl = processEnv.DATABASE_URL || "";
  const directUrl = processEnv.DIRECT_URL || databaseUrl;

  return {
    databaseUrl,
    directUrl,
  };
}
