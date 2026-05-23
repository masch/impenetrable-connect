import { Hono } from "hono";
import { ZodError } from "zod";
import { CreateVentureSchema, UpdateVentureSchema } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { VentureService } from "../services/venture.service";
import {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_NO_CONTENT,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_ERROR,
} from "../constants/http-status";

const router = new Hono<AppEnv>();

router.use("*", authMiddleware);

/**
 * GET /v1/ventures
 * Returns all ventures. If userId query param is provided, filters by user membership.
 * Query param (optional): userId (string) — filter ventures where user is a member
 * Requires auth.
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;
    const userId = c.req.query("userId");

    if (userId) {
      const result = await VentureService.getByUserId(db, userId);
      return c.json(result, HTTP_OK);
    }

    const result = await VentureService.getAll(db);
    return c.json(result, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching ventures", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * POST /v1/ventures
 * Creates a new venture.
 * Requires auth.
 * Body: CreateVentureSchema
 */
router.post("/", async (c) => {
  try {
    const db = c.var.db;
    const body = await c.req.json();
    const validated = CreateVentureSchema.parse(body);

    const newVenture = await VentureService.create(db, validated);

    return c.json(newVenture, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Venture validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    logger.error("Error creating venture", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * PUT /v1/ventures/:id
 * Updates an existing venture.
 * Requires auth.
 * Param: id (number) — venture ID
 * Body: UpdateVentureSchema
 */
router.put("/:id", async (c) => {
  try {
    const db = c.var.db;
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ error: "Invalid ID" }, HTTP_BAD_REQUEST);
    }

    const body = await c.req.json();
    const validated = UpdateVentureSchema.parse(body);

    const updated = await VentureService.update(db, id, validated);

    if (!updated) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Venture update validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    logger.error("Error updating venture", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

/**
 * DELETE /v1/ventures/:id
 * Soft-deletes a venture (sets is_active to false and deletedAt).
 * Requires auth.
 * Param: id (number) — venture ID
 */
router.delete("/:id", async (c) => {
  try {
    const db = c.var.db;
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ error: "Invalid ID" }, HTTP_BAD_REQUEST);
    }

    const deleted = await VentureService.softDelete(db, id);

    if (!deleted) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    return c.body(null, HTTP_NO_CONTENT);
  } catch (error) {
    logger.error("Error deleting venture", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as venturesRouter };
