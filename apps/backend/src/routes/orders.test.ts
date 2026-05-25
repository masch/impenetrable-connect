import { Hono } from "hono";
import { describe, expect, it, beforeAll, beforeEach, spyOn } from "bun:test";
import { sign } from "hono/jwt";
import * as dbFactory from "../db/index";
import { resetDbCache, dbMiddleware } from "../middleware/db";
import { authMiddleware } from "../middleware/auth";
import { ordersRouter } from "./orders";
import type { AppEnv } from "../config/env";
import { reservations, productCategories, ventures, products, orders } from "../db/schema";

const TEST_ENV = {
  DATABASE_URL: "postgres://localhost:5432/db",
  JWT_SECRET: "test-secret",
};

const createTestApp = () => {
  const app = new Hono<AppEnv>();
  app.use("*", dbMiddleware);
  app.use("*", authMiddleware);
  app.route("/v1/orders", ordersRouter);
  return app;
};

describe("Orders API", () => {
  let touristToken: string;
  let adminToken: string;
  let entrepreneurToken: string;
  let testApp: Hono<AppEnv>;

  const mockOrder = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440000",
    zzz_reservation_id: "550e8400-e29b-41d4-a716-446655440001",
    zzz_product_category_id: 1,
    zzz_confirmed_venture_id: null,
    zzz_notes: null,
    zzz_global_status: "SEARCHING",
    zzz_cancel_reason: null,
    zzz_cancelled_at: null,
    zzz_completed_at: null,
    zzz_confirmed_at: null,
    zzz_current_offer_venture_id: null,
    zzz_notify_whatsapp: false,
    zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzDeletedAt: null,
  };

  const mockReservation = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440001",
    zzz_user_id: "test-user-id",
    zzz_status: "CREATED",
    zzz_guest_count: 2,
    zzz_service_at: new Date("2026-05-25T12:00:00.000Z"),
  };

  const createListBuilder = (result: unknown[]) => {
    const builder: Record<string, unknown> = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      offset: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (_reject: (e: Error) => unknown) => Promise.resolve(result).catch(_reject),
    };
    return builder;
  };

  const createWhereChain = (result: unknown[]) => {
    const p = Promise.resolve(result);
    return {
      limit: () => p,
      orderBy: () => p,
      then: p.then.bind(p),
      catch: p.catch.bind(p),
    };
  };

  /**
   * Creates a mock Db object that wraps transaction for OrderService.create/updateStatus.
   * Uses call-count-based response switching for select/insert chains.
   */
  const createTxDb = (selectResults: unknown[][], _insertResults?: unknown[][]) => {
    const mockTx = {
      select: (_fields?: unknown) => ({
        from: (table: unknown) => {
          return {
            innerJoin: (_joinTable: unknown, _joinCond: unknown) => {
              return {
                where: () => {
                  return Promise.resolve([{ occupied: 0 }]);
                },
              };
            },
            where: () => {
              let result: unknown[] = [];
              if (table === reservations) {
                result = selectResults[0] ?? [mockReservation];
              } else if (table === productCategories) {
                result = [{ zzz_id: 1, zzz_project_id: 1 }];
              } else if (table === ventures) {
                result = [
                  {
                    id: 1,
                    name: "Venture 1",
                    zzz_max_capacity: 10,
                    zzz_cascade_order: 0,
                    zzz_is_active: true,
                    zzz_is_paused: false,
                    zzz_product_category_id: 1,
                    zzz_project_id: 1,
                  },
                ];
              } else if (table === products) {
                result = selectResults[1] ?? [{ zzz_id: 1, zzz_price: 25.0 }];
              } else {
                result = selectResults[0] ?? [mockOrder];
              }
              return createWhereChain(result);
            },
            orderBy: () => createWhereChain(selectResults[0] ?? [mockOrder]),
            limit: () => createWhereChain(selectResults[0] ?? [mockOrder]),
            then: (resolve: (v: unknown) => unknown) => resolve(selectResults[0] ?? []),
          };
        },
      }),
      insert: (insertTable: unknown) => ({
        values: (vals: unknown) => ({
          returning: () => {
            if (insertTable === orders) {
              const createdOrder = {
                ...mockOrder,
                ...(vals as Record<string, unknown>),
                zzz_id: mockOrder.zzz_id,
              };
              return Promise.resolve([createdOrder]);
            } else {
              const items = Array.isArray(vals) ? (vals as unknown[]) : [vals];
              const createdItems = items.map((item: unknown, i: number) => ({
                ...(item as Record<string, unknown>),
                zzz_id: `item-${i}`,
              }));
              return Promise.resolve(createdItems);
            }
          },
        }),
      }),
      update: () => ({
        set: (_vals: unknown) => ({
          where: () => ({
            returning: () => {
              const result = selectResults[0] ?? [mockOrder];
              return Promise.resolve(result);
            },
          }),
        }),
      }),
    };

    return {
      transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
    } as unknown as ReturnType<typeof dbFactory.createDb>;
  };

  beforeAll(async () => {
    testApp = createTestApp();
    touristToken = await sign(
      { sub: "test-user-id", role: "TOURIST", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
    adminToken = await sign(
      { sub: "admin-id", role: "ADMIN", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
    entrepreneurToken = await sign(
      { sub: "ent-id", role: "ENTREPRENEUR", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
  });

  beforeEach(() => {
    resetDbCache();
  });

  describe("POST /v1/orders", () => {
    const validBody = {
      zzz_reservation_id: "550e8400-e29b-41d4-a716-446655440001",
      zzz_product_category_id: 1,
      zzz_notify_whatsapp: false,
      zzz_items: [{ zzz_catalog_item_id: 1, zzz_quantity: 2 }],
    };

    const orderWithItems = {
      ...mockOrder,
      zzz_items: [
        {
          zzz_id: "item-1",
          zzz_order_id: mockOrder.zzz_id,
          zzz_catalog_item_id: 1,
          zzz_quantity: 2,
          zzz_price: 25.0,
        },
      ],
    };

    it("should return 201 when creating order (TOURIST)", async () => {
      const mockDb = createTxDb(
        [[mockReservation], [{ zzz_id: 1, zzz_price: 25.0 }]],
        [[mockOrder], [orderWithItems.zzz_items]],
      );
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.zzz_global_status).toBe("OFFER_PENDING");
      expect(body.zzz_items).toHaveLength(1);
    });

    it("should return 403 when non-TOURIST creates order", async () => {
      const res = await testApp.request(
        "/v1/orders",
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
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify({ zzz_reservation_id: "not-a-uuid" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 400 when items array is empty", async () => {
      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify({ ...validBody, zzz_items: [] }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("should return 404 when reservation not found", async () => {
      const mockDb = createTxDb([[], []]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Reservation not found");
    });

    it("should return 403 when creating order on another's reservation", async () => {
      const otherReservation = { ...mockReservation, zzz_user_id: "other-user" };
      const mockDb = createTxDb([[otherReservation], []]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Order must belong to your reservation");
    });

    it("should return 409 when reservation is cancelled", async () => {
      const cancelledReservation = { ...mockReservation, zzz_status: "CANCELLED" };
      const mockDb = createTxDb([[cancelledReservation], []]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(validBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error).toBe("Cannot create orders on a cancelled reservation");
    });

    it("should return 500 on DB failure", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        transaction: () => Promise.reject(new Error("Database crash")),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
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

  describe("GET /v1/orders", () => {
    it("should return 200 with array", async () => {
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => createListBuilder([mockOrder]),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        "/v1/orders",
        {
          headers: { Authorization: `Bearer ${touristToken}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request("/v1/orders", {}, TEST_ENV);
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
        "/v1/orders",
        {
          headers: { Authorization: `Bearer ${touristToken}` },
        },
        TEST_ENV,
      );

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("PATCH /v1/orders/:id", () => {
    const updateBody = { zzz_notes: "Updated notes" };
    const updatedOrder = { ...mockOrder, zzz_notes: "Updated notes" };

    it("should return 200 when updating own order", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockOrder]),
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([updatedOrder]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>;

      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.zzz_notes).toBe("Updated notes");
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
        "/v1/orders/550e8400-e29b-41d4-a716-446655440002",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
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
              limit: () => Promise.resolve([mockOrder]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 400 when order is in terminal state", async () => {
      const terminalOrder = { ...mockOrder, zzz_global_status: "COMPLETED" };
      spyOn(dbFactory, "createDb").mockReturnValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([terminalOrder]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof dbFactory.createDb>);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Cannot update a terminal order");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("should return 400 when UUID is malformed", async () => {
      const res = await testApp.request(
        "/v1/orders/not-a-valid-uuid",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify(updateBody),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Invalid ID format");
    });
  });

  describe("PATCH /v1/orders/:id/status", () => {
    it("should return 200 on valid transition (ENTREPRENEUR)", async () => {
      const mockDb = createTxDb([[mockOrder]]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${entrepreneurToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toBeDefined();
    });

    it("should return 200 on valid transition (ADMIN)", async () => {
      const mockDb = createTxDb([[mockOrder]]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toBeDefined();
    });

    it("should return 403 on TOURIST role", async () => {
      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${touristToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.message).toBe("errors.auth.forbidden");
    });

    it("should return 400 on invalid transition", async () => {
      const mockDb = createTxDb([[mockOrder]]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${entrepreneurToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "CONFIRMED" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid status transition");
    });

    it("should return 400 when cancelling without reason", async () => {
      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${entrepreneurToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "CANCELLED" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should return 404 when order not found", async () => {
      const mockDb = createTxDb([[]]);
      spyOn(dbFactory, "createDb").mockReturnValue(mockDb);

      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${entrepreneurToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Order not found");
    });

    it("should return 401 without auth token", async () => {
      const res = await testApp.request(
        `/v1/orders/${mockOrder.zzz_id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("should return 400 when UUID is malformed", async () => {
      const res = await testApp.request(
        "/v1/orders/not-a-valid-uuid/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${entrepreneurToken}`,
          },
          body: JSON.stringify({ zzz_global_status: "OFFER_PENDING" }),
        },
        TEST_ENV,
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Invalid ID format");
    });
  });
});
