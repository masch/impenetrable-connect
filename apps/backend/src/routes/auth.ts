import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { LoginInputSchema } from "@repo/shared";
import { AuthService } from "../services/auth.service";

export const authRouter = new Hono();

authRouter.post("/login", zValidator("json", LoginInputSchema), async (c) => {
  const input = c.req.valid("json");

  const result = await AuthService.login(input);

  if (!result) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  return c.json(result);
});
