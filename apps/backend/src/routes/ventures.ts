import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import { ventures, ventureMembers } from "../db/schema";
import { asc, desc } from "drizzle-orm";
import { ZodError } from "zod";
import { CreateVentureSchema, UpdateVentureSchema } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";

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
      const memberships = await db
        .select({ ventureId: ventureMembers.ventureId })
        .from(ventureMembers)
        .where(eq(ventureMembers.userId, userId));

      if (memberships.length === 0) {
        return c.json([]);
      }

      const ventureIds = memberships.map((m) => m.ventureId);

      const result = await db
        .select()
        .from(ventures)
        .where(inArray(ventures.id, ventureIds))
        .orderBy(desc(ventures.zzz_is_active), asc(ventures.name));

      return c.json(result);
    }

    const result = await db
      .select()
      .from(ventures)
      .orderBy(desc(ventures.zzz_is_active), asc(ventures.name));
    return c.json(result);
  } catch (error) {
    logger.error("Error fetching ventures", error);
    return c.json({ error: "Internal Server Error" }, 500);
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

    const [newVenture] = await db.insert(ventures).values(validated).returning();

    return c.json(newVenture, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Venture validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, 400);
    }
    logger.error("Error creating venture", error);
    return c.json({ error: "Internal Server Error" }, 500);
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
      return c.json({ error: "Invalid ID" }, 400);
    }

    const body = await c.req.json();
    const validated = UpdateVentureSchema.parse(body);

    const [updated] = await db
      .update(ventures)
      .set(validated)
      .where(eq(ventures.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Not Found" }, 404);
    }

    return c.json(updated, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Venture update validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, 400);
    }
    logger.error("Error updating venture", error);
    return c.json({ error: "Internal Server Error" }, 500);
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
      return c.json({ error: "Invalid ID" }, 400);
    }

    const [deleted] = await db
      .update(ventures)
      .set({ zzz_is_active: false, zzzDeletedAt: new Date() })
      .where(eq(ventures.id, id))
      .returning();

    if (!deleted) {
      return c.json({ error: "Not Found" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    logger.error("Error deleting venture", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default router;
