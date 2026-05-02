import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { type AppEnv, getAppConfig } from "../config/env";
import { UserRole } from "@repo/shared";
import { logger } from "../services/logger.service";

/**
 * Clean & Dynamic JWT authentication middleware.
 * Uses the low-level 'verify' function to avoid middleware-in-middleware overhead.
 */
export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized: Missing or invalid token format" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const { jwtSecret } = getAppConfig(c);

  try {
    const payload = await verify(token, jwtSecret, "HS256");
    c.set("jwtPayload", payload);
    await next();
  } catch (error) {
    logger.warn(
      `JWT Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return c.json({ message: "Unauthorized: Invalid or expired token" }, 401);
  }
};

/**
 * Role-based access control guard
 */
export const roleGuard = (allowedRoles: UserRole[]) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole } | undefined;

    if (!payload || !payload.role) {
      logger.warn(`Unauthorized access attempt: No role found in token`);
      return c.json({ message: "Unauthorized" }, 401);
    }

    if (!allowedRoles.includes(payload.role)) {
      logger.warn(
        `Forbidden access attempt: Role ${payload.role} not in allowed list [${allowedRoles.join(", ")}]`,
      );
      return c.json({ message: "Forbidden" }, 403);
    }

    await next();
  };
};
