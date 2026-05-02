import { describe, expect, it, beforeAll, afterAll, spyOn, type Mock } from "bun:test";
import { Hono } from "hono";
import { authRouter } from "./auth";
import { sign } from "hono/jwt";
import { MOCK_USER_ADMIN, MOCK_USER_ENTREPRENEUR_WITH_ORDERS, UserRole } from "@repo/shared";
import { authMiddleware, roleGuard } from "../middleware/auth";
import { dbMiddleware } from "../middleware/db";
import * as dbFactory from "../db/index";
import { AuthService } from "../services/auth.service";
import { type AppEnv } from "../config/env";

const testApp = new Hono<AppEnv>();

testApp.use("*", dbMiddleware);

testApp.route("/v1/auth", authRouter);
testApp.get("/v1/test-protected", authMiddleware, (c) => c.text("OK"));
testApp.get("/v1/test-admin", authMiddleware, roleGuard([UserRole.ADMIN]), (c) => c.text("OK"));

const TEST_ENV = {
  DATABASE_URL: "postgres://localhost:5432/db",
  JWT_SECRET: "test-secret",
};

describe("Auth API Integration", () => {
  let adminToken: string;
  let entrepreneurToken: string;
  let createDbSpy: Mock<typeof dbFactory.createDb>;
  let loginSpy: Mock<typeof AuthService.login>;

  beforeAll(async () => {
    // Mock createDb to avoid connection errors, although it won't be used by our mocked AuthService
    createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue(
      {} as unknown as ReturnType<typeof dbFactory.createDb>,
    );

    // Mock AuthService.login to return predictable results with real signed tokens
    loginSpy = spyOn(AuthService, "login").mockImplementation(async (input: unknown) => {
      const loginInput = input as { email?: string; password?: string; alias?: string };
      if (loginInput.password === "wrong-password") return null;

      const is_admin = loginInput.email === MOCK_USER_ADMIN.email;
      const role = is_admin ? UserRole.ADMIN : UserRole.ENTREPRENEUR;
      const user = is_admin ? MOCK_USER_ADMIN : MOCK_USER_ENTREPRENEUR_WITH_ORDERS;

      const accessToken = await sign(
        { sub: user.id || "1", role, exp: Math.floor(Date.now() / 1000) + 3600 },
        TEST_ENV.JWT_SECRET,
      );

      return {
        user: { ...user, role } as unknown as typeof MOCK_USER_ADMIN,
        accessToken,
        refreshToken: "11111111-2222-3333-4444-555555555555" as const,
      };
    });

    // Login as Admin
    const adminRes = await testApp.request(
      "/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: MOCK_USER_ADMIN.email,
          password: "password123",
        }),
      },
      TEST_ENV,
    );
    const adminBody = (await adminRes.json()) as { accessToken: string };
    adminToken = adminBody.accessToken;

    // Login as Entrepreneur
    const entRes = await testApp.request(
      "/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.email,
          password: "password123",
        }),
      },
      TEST_ENV,
    );
    const entBody = (await entRes.json()) as { accessToken: string };
    entrepreneurToken = entBody.accessToken;
  });

  it("should login successfully and return tokens", () => {
    expect(adminToken).toBeDefined();
    expect(entrepreneurToken).toBeDefined();
  });

  it("should allow access to protected route with valid token", async () => {
    const res = await testApp.request(
      "/v1/test-protected",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });

  it("should deny access to protected route without token", async () => {
    const res = await testApp.request("/v1/test-protected", {}, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it("should allow admin to access admin route", async () => {
    const res = await testApp.request(
      "/v1/test-admin",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
  });

  it("should deny entrepreneur from accessing admin route", async () => {
    const res = await testApp.request(
      "/v1/test-admin",
      {
        headers: { Authorization: `Bearer ${entrepreneurToken}` },
      },
      TEST_ENV,
    );
    expect(res.status).toBe(403);
  });

  it("should return 401 for invalid password", async () => {
    const res = await testApp.request(
      "/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: MOCK_USER_ADMIN.email,
          password: "wrong-password",
        }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  afterAll(() => {
    createDbSpy.mockRestore();
    loginSpy.mockRestore();
  });
});
