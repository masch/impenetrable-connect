import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { authMiddleware, roleGuard } from "./auth";
import { sign } from "hono/jwt";
import { UserRole } from "@repo/shared";

describe("Auth Middleware & Role Guard", () => {
  const secret = "test-secret";

  const createApp = () => {
    const app = new Hono<{ Bindings: { JWT_SECRET: string } }>();
    return app;
  };

  describe("authMiddleware", () => {
    it("should allow valid tokens", async () => {
      const app = createApp();
      const token = await sign({ sub: "user1", role: UserRole.ADMIN }, secret);

      app.use("*", authMiddleware);
      app.get("/test", (c) => c.text("ok"));

      const res = await app.request(
        "/test",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        { JWT_SECRET: secret, DATABASE_URL: "postgres://localhost:5432/db" },
      );

      expect(res.status).toBe(200);
    });

    it("should return 401 for invalid tokens (catch block coverage)", async () => {
      const app = createApp();

      app.use("*", authMiddleware);
      app.get("/test", (c) => c.text("ok"));

      const res = await app.request(
        "/test",
        {
          headers: { Authorization: `Bearer invalid-token` },
        },
        { JWT_SECRET: secret, DATABASE_URL: "postgres://localhost:5432/db" },
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toBe("Unauthorized: Invalid or expired token");
    });
  });

  describe("roleGuard", () => {
    it("should allow authorized roles", async () => {
      const app = createApp();
      const token = await sign({ sub: "user1", role: UserRole.ADMIN }, secret);

      app.use("*", authMiddleware);
      app.get("/admin", roleGuard([UserRole.ADMIN]), (c) => c.text("admin-ok"));

      const res = await app.request(
        "/admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        { JWT_SECRET: secret, DATABASE_URL: "postgres://localhost:5432/db" },
      );

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("admin-ok");
    });

    it("should return 401 if role is missing in token (line 38-39 coverage)", async () => {
      const app = createApp();
      // Token without role
      const token = await sign({ sub: "user1" }, secret);

      app.use("*", authMiddleware);
      app.get("/guarded", roleGuard([UserRole.ADMIN]), (c) => c.text("ok"));

      const res = await app.request(
        "/guarded",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        { JWT_SECRET: secret, DATABASE_URL: "postgres://localhost:5432/db" },
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toBe("Unauthorized");
    });

    it("should return 403 for unauthorized roles", async () => {
      const app = createApp();
      const token = await sign({ sub: "user1", role: UserRole.ENTREPRENEUR }, secret);

      app.use("*", authMiddleware);
      app.get("/admin", roleGuard([UserRole.ADMIN]), (c) => c.text("ok"));

      const res = await app.request(
        "/admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        { JWT_SECRET: secret, DATABASE_URL: "postgres://localhost:5432/db" },
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.message).toBe("Forbidden");
    });
  });
});
