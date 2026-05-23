import { Hono } from "hono";
import { ZodError } from "zod";
import { CreateProjectSchema } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { ProjectService } from "../services/project.service";
import {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_ERROR,
} from "../constants/http-status";

const router = new Hono<AppEnv>();

router.use("*", authMiddleware);

/**
 * GET /v1/projects
 * Returns all projects ordered by active status then name.
 * Requires auth.
 */
router.get("/", async (c) => {
  const db = c.var.db;
  const result = await ProjectService.getAll(db);
  return c.json(result, HTTP_OK);
});

/**
 * GET /v1/projects/:id
 * Returns a single project by ID.
 * Requires auth.
 * Param: id (number) — project ID
 */
router.get("/:id", async (c) => {
  const db = c.var.db;
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, HTTP_BAD_REQUEST);
  }

  const project = await ProjectService.getById(db, id);

  if (!project) {
    return c.json({ error: "Project not found" }, HTTP_NOT_FOUND);
  }

  return c.json(project, HTTP_OK);
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

    const newProject = await ProjectService.create(db, validated);

    return c.json(newProject, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Project validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    logger.error("Error creating project", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as projectsRouter };
