import { Hono } from "hono";
import { ZodError } from "zod";
import {
  CreateOrderInputSchema,
  UpdateOrderInputSchema,
  UpdateOrderStatusInputSchema,
  UserRole,
} from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware, roleGuard } from "../middleware/auth";
import { OrderService, OrderServiceError } from "../services/order.service";
import {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_ERROR,
} from "../constants/http-status";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = new Hono<AppEnv>();
router.use("*", authMiddleware);

/**
 * POST /v1/orders
 * Creates a new order with items. TOURIST only.
 * Body: CreateOrderInputSchema
 */
router.post("/", roleGuard([UserRole.TOURIST]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const body = (await c.req.json()) as unknown;
    const validated = CreateOrderInputSchema.parse(body);

    const order = await OrderService.create(db, payload.sub, validated);
    return c.json(order, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Order validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof OrderServiceError) {
      return c.json({ error: error.message }, error.httpStatus as never);
    }
    logger.error("Error creating order", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * GET /v1/orders
 * Lists orders with role-based scoping and optional filters.
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const status = c.req.query("status");
    const reservationId = c.req.query("reservation_id");
    const limit = Number(c.req.query("limit") as string) || undefined;
    const offset = Number(c.req.query("offset") as string) || undefined;

    const results = await OrderService.getAll(
      db,
      { status: status as never, reservation_id: reservationId, limit, offset },
      payload.role,
      payload.sub,
    );
    return c.json(results, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching orders", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * PATCH /v1/orders/:id
 * Updates order metadata (notes, notify_whatsapp).
 * Any authenticated user. Service-layer scoping.
 */
router.patch("/:id", async (c) => {
  try {
    const db = c.var.db;
    const id = c.req.param("id") as string;

    if (!UUID_REGEX.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const body = (await c.req.json()) as unknown;
    const validated = UpdateOrderInputSchema.parse(body);

    const updated = await OrderService.update(db, id, validated);
    if (!updated) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }
    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Order validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof OrderServiceError) {
      return c.json({ error: error.message }, error.httpStatus as never);
    }
    logger.error("Error updating order", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * PATCH /v1/orders/:id/status
 * Transitions order status. ENTREPRENEUR or ADMIN only.
 * Body: UpdateOrderStatusInputSchema
 */
router.patch("/:id/status", roleGuard([UserRole.ENTREPRENEUR, UserRole.ADMIN]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id") as string;

    if (!UUID_REGEX.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const body = (await c.req.json()) as unknown;
    const validated = UpdateOrderStatusInputSchema.parse(body);

    const updated = await OrderService.updateStatus(db, id, validated, payload.sub, payload.role);
    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Order status validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof OrderServiceError) {
      return c.json({ error: error.message }, error.httpStatus as never);
    }
    logger.error("Error updating order status", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as ordersRouter };
