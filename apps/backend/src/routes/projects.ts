import { Hono } from "hono";
import { projects } from "../db/schema/projects";
import { desc, eq } from "drizzle-orm";
import { ZodError } from "zod";
import { CreateProjectSchema } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";

const router = new Hono<AppEnv>();

router.use("*", authMiddleware);

/**
 * GET /v1/projects
 * Returns all projects ordered by active status then name.
 * Requires auth.
 */
router.get("/", async (c) => {
  const db = c.var.db;
  const result = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.zzz_is_active), projects.zzz_name);
  return c.json(result);
});

/**
 * GET /v1/projects/:id
 * Returns a single project by ID.
 * Requires auth.
 * Param: id (number) — project ID
 */
router.get("/:id", async (c) => {
  const db = c.var.db;
  const id = c.req.param("id");
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.zzz_id, Number(id)))
    .limit(1);

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json(project);
});

/**
 * POST /v1/projects
 * Creates a new project.
 * Requires auth.
 * Body: CreateProjectSchema (name, description, etc.)
 */
router.post("/", async (c) => {
  try {
    const db = c.var.db;
    const body = await c.req.json();
    const validated = CreateProjectSchema.parse(body);

    const [newProject] = await db.insert(projects).values(validated).returning();

    return c.json(newProject, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Project validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, 400);
    }
    logger.error("Error creating project", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default router;
