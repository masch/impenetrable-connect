import { Hono } from "hono";
import { describe, expect, it, beforeAll, beforeEach, spyOn } from "bun:test";
import { sign } from "hono/jwt";
import * as dbFactory from "../db/index";
import { resetDbCache, dbMiddleware } from "../middleware/db";
import { authMiddleware } from "../middleware/auth";
import { reservationsRouter } from "./reservations";
import type { AppEnv } from "../config/env";

const TEST_ENV = {
  DATABASE_URL: "postgres://localhost:5432/db",
  JWT_SECRET: "test-secret",
};

const createTestApp = () => {
  const app = new Hono<AppEnv>();
  app.use("*", dbMiddleware);
  app.use("*", authMiddleware);
  app.route("/v1/reservations", reservationsRouter);
  return app;
};

describe("Reservations API", () => {
  let token: string;
  let adminToken: string;
  let testApp: Hono<AppEnv>;

  const mockReservation = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440000",
    zzz_user_id: "test-user-id",
    zzz_service_at: new Date("2026-06-15T10:00:00.000Z"),
    zzz_time_of_day: "LUNCH",
    zzz_status: "CREATED",
    zzz_guest_count: 4,
    zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzDeletedAt: null,
  };

  const createListBuilder = (result: unknown[]) => {
    const builder = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      offset: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (reject: (e: Error) => unknown) => Promise.resolve(result).catch(reject),
    };
    return builder;
  };

  beforeAll(async () => {
    testApp = createTestApp();
    token = await sign(
      { sub: "test-user-id", role: "TOURIST", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
    adminToken = await sign(
      { sub: "admin-id", role: "ADMIN", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
  });

  beforeEach(() => {
    resetDbCache();
  });

  describe("POST /v1/reservations", () => {
    const validBody = {
      zzz_service_at: "3026-06-15T10:00:00Z",
      zzz_time_of_day: "LUNCH",
      zzz_guest_count: 4,
    };

    const futureDate = new Date("3026-06-15T10:00:00.000Z");

    it("should return 201 when creating a reservation (TOURIST)", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        insert: () => ({
          values: () => ({
            returning: () => Promise.resolve([{ ...mockReservation, zzz_service_at: futureDate }]),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("zzz_id");
      expect(body.zzz_user_id).toBe("test-user-id");
    });

    it("should return 403 when non-TOURIST creates reservation", async () => {
      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.message).toBe("errors.auth.forbidden");
    });

    it("should return 400 when body is invalid", async () => {
      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ zzz_time_of_day: "INVALID" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 400 when service_at is in the past", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        insert: () => ({
          values: () => ({
            returning: () => Promise.resolve([mockReservation]),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...validBody,
            zzz_service_at: "2020-01-01T00:00:00Z",
          }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("zzz_service_at must be in the future");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("should return 500 on DB failure", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        insert: () => ({
          values: () => ({
            returning: () => Promise.reject(new Error("Database crash")),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("GET /v1/reservations", () => {
    it("should return 200 with array", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => createListBuilder([mockReservation]),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request("/v1/reservations", {}, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it("should return 500 on DB failure", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => {
            throw new Error("Database crash");
          },
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("GET /v1/reservations/:id", () => {
    it("should return 200 with reservation", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.zzz_id).toBe(mockReservation.zzz_id);
    });

    it("should return 404 when not found", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations/550e8400-e29b-41d4-a716-446655440001",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Not Found");
    });

    it("should return 400 when UUID is malformed", async () => {
      const res = await testApp.request(
        "/v1/reservations/not-a-valid-uuid",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Invalid ID format");
    });

    it("should return 403 when tourist accesses another's reservation", async () => {
      const otherReservation = { ...mockReservation, zzz_user_id: "other-user" };
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([otherReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${otherReservation.zzz_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Forbidden");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(`/v1/reservations/${mockReservation.zzz_id}`, {}, TEST_ENV);

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /v1/reservations/:id", () => {
    const updateBody = { zzz_guest_count: 6 };
    const updatedReservation = { ...mockReservation, zzz_guest_count: 6 };

    it("should return 200 when updating own reservation", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockReservation]),
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([updatedReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>;

      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.zzz_guest_count).toBe(6);
    });

    it("should return 404 when not found", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/reservations/550e8400-e29b-41d4-a716-446655440001",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Not Found");
    });

    it("should return 400 when body is empty", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 400 when updating cancelled reservation", async () => {
      const cancelledReservation = { ...mockReservation, zzz_status: "CANCELLED" };
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([cancelledReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Cannot update a cancelled reservation");
    });

    it("should return 400 when service_at is in the past", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ zzz_service_at: "2020-01-01T00:00:00Z" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("zzz_service_at must be in the future");
    });

    it("should return 403 when tourist updates another's reservation", async () => {
      const otherReservation = { ...mockReservation, zzz_user_id: "other-user" };
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([otherReservation]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Forbidden");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(
        `/v1/reservations/${mockReservation.zzz_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(401);
    });
  });
});
