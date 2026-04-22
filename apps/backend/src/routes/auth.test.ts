import { describe, expect, it, beforeAll } from "bun:test";
import { Hono } from "hono";
import { authRouter } from "./auth";
import { authMiddleware, roleGuard } from "../middleware/auth";
import { MOCK_USER_ADMIN, MOCK_USER_ENTREPRENEUR_WITH_ORDERS } from "@repo/shared";

const testApp = new Hono();

testApp.route("/v1/auth", authRouter);
testApp.get("/v1/test-protected", authMiddleware, (c) => c.text("OK"));
testApp.get("/v1/test-admin", authMiddleware, roleGuard(["ADMIN"]), (c) => c.text("OK"));

describe("Auth API Integration", () => {
  let adminToken: string;
  let entrepreneurToken: string;

  beforeAll(async () => {
    // Login as Admin
    const adminRes = await testApp.request("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: MOCK_USER_ADMIN.email,
        password: "password123",
      }),
    });
    const adminBody = await adminRes.json();
    adminToken = adminBody.accessToken;

    // Login as Entrepreneur
    const entRes = await testApp.request("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.email,
        password: "password123",
      }),
    });
    const entBody = await entRes.json();
    entrepreneurToken = entBody.accessToken;
  });

  it("should login successfully and return tokens", () => {
    expect(adminToken).toBeDefined();
    expect(entrepreneurToken).toBeDefined();
  });

  it("should allow access to protected route with valid token", async () => {
    const res = await testApp.request("/v1/test-protected", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });

  it("should deny access to protected route without token", async () => {
    const res = await testApp.request("/v1/test-protected");
    expect(res.status).toBe(401);
  });

  it("should allow admin to access admin route", async () => {
    const res = await testApp.request("/v1/test-admin", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });

  it("should deny entrepreneur from accessing admin route", async () => {
    const res = await testApp.request("/v1/test-admin", {
      headers: { Authorization: `Bearer ${entrepreneurToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return 401 for invalid password", async () => {
    const res = await testApp.request("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: MOCK_USER_ADMIN.email,
        password: "wrong-password",
      }),
    });
    expect(res.status).toBe(401);
  });
});
