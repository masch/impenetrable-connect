import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { LoginInputSchema, CreateUserInputSchema } from "@repo/shared";
import { AuthService } from "../services/auth.service";
import { getAppConfig, type AppEnv } from "../config/env";

export const authRouter = new Hono<AppEnv>();

/**
 * POST /v1/auth/login
 * Authenticates a user with email/alias and password.
 * Returns JWT token and user data on success.
 * Public endpoint — no auth required.
 * Body: LoginInputSchema (email + password)
 */
authRouter.post("/login", zValidator("json", LoginInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = c.var.db;
  const { jwtSecret } = getAppConfig(c);

  const result = await AuthService.login(input, db, jwtSecret);

  if (!result) {
    return c.json({ message: "errors.auth.invalid_credentials" }, 401);
  }

  return c.json(result);
});

/**
 * POST /v1/auth/tourist/create
 * Creates a new tourist user (no password, alias-based).
 * Returns JWT token and user data.
 * Public endpoint — no auth required.
 * Body: CreateUserInputSchema (alias)
 */
authRouter.post("/tourist/create", zValidator("json", CreateUserInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = c.var.db;
  const { jwtSecret } = getAppConfig(c);

  const result = await AuthService.createTourist(input, db, jwtSecret);

  return c.json(result);
});
