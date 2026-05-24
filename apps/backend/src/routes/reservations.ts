import { Hono } from "hono";
import { ZodError } from "zod";
import { CreateReservationInputSchema, UpdateReservationInputSchema, UserRole } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware, roleGuard } from "../middleware/auth";
import { ReservationService, ReservationValidationError } from "../services/reservation.service";
import {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
} from "../constants/http-status";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = new Hono<AppEnv>();
router.use("*", authMiddleware);

/**
 * POST /v1/reservations
 * Creates a new reservation. TOURIST only.
 * Body: CreateReservationInputSchema
 */
router.post("/", roleGuard([UserRole.TOURIST]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const body = (await c.req.json()) as unknown;
    const validated = CreateReservationInputSchema.parse(body);

    const reservation = await ReservationService.create(db, payload.sub, validated);
    return c.json(reservation, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Reservation validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof ReservationValidationError) {
      logger.warn("Reservation business rule violation", { error: error.message });
      return c.json({ error: error.message }, HTTP_BAD_REQUEST);
    }
    logger.error("Error creating reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * GET /v1/reservations
 * Lists reservations with role-based scoping.
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const status = c.req.query("status");
    const limit = Number(c.req.query("limit")) || undefined;
    const offset = Number(c.req.query("offset")) || undefined;

    const results = await ReservationService.getAll(
      db,
      { status, limit, offset },
      payload.role,
      payload.sub,
    );
    return c.json(results, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching reservations", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * GET /v1/reservations/:id
 * Returns a single reservation by UUID. Role-scoped at route level.
 */
router.get("/:id", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id");

    // Basic UUID format check
    if (!UUID_REGEX.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const reservation = await ReservationService.getById(db, id);
    if (!reservation) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    // Scoping check at route level for single-resource access
    if (payload.role === UserRole.TOURIST && reservation.zzz_user_id !== payload.sub) {
      return c.json({ error: "Forbidden" }, HTTP_FORBIDDEN);
    }

    return c.json(reservation, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * PATCH /v1/reservations/:id
 * Updates reservation metadata. Role-scoped at route level.
 * Body: UpdateReservationInputSchema
 */
router.patch("/:id", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id");

    // Basic UUID format check
    if (!UUID_REGEX.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const body = (await c.req.json()) as unknown;
    const validated = UpdateReservationInputSchema.parse(body);

    // Fetch current state for scoping check
    const current = await ReservationService.getById(db, id);
    if (!current) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    // Scoping check
    if (payload.role === UserRole.TOURIST && current.zzz_user_id !== payload.sub) {
      return c.json({ error: "Forbidden" }, HTTP_FORBIDDEN);
    }

    const updated = await ReservationService.update(db, id, validated);
    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Reservation validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof ReservationValidationError) {
      logger.warn("Reservation business rule violation", { error: error.message });
      return c.json({ error: error.message }, HTTP_BAD_REQUEST);
    }
    logger.error("Error updating reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as reservationsRouter };
