import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { UserRole } from "@repo/shared";
import { logger } from "../services/logger.service";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";

/**
 * Basic JWT middleware to verify the token
 */
export const authMiddleware = jwt({
  secret: JWT_SECRET,
  alg: "HS256",
});

/**
 * Role-based access control guard
 */
export const roleGuard = (allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
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
