import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { LoginInputSchema } from "@repo/shared";
import { AuthService } from "../services/auth.service";
import { getAppConfig, type AppEnv } from "../config/env";

export const authRouter = new Hono<AppEnv>();

authRouter.post("/login", zValidator("json", LoginInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = c.var.db;
  const { jwtSecret } = getAppConfig(c);

  const result = await AuthService.login(input, db, jwtSecret);

  if (!result) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  return c.json(result);
});
