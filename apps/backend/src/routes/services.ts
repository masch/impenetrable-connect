import { Hono } from "hono";
import { type AppEnv } from "../config/env";
import { logger } from "../services/logger.service";
import { ProjectService } from "../services/project.service";
import { ProductService } from "../services/product.service";
import { HTTP_OK, HTTP_INTERNAL_ERROR } from "../constants/http-status";

const router = new Hono<AppEnv>();

/**
 * GET /v1/services
 * Returns all products for the first active project.
 * Public endpoint — no auth required since the product catalog is browsable.
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;

    // Find the first active project using service
    const activeProject = await ProjectService.getFirstActive(db);

    if (!activeProject) {
      return c.json([], HTTP_OK);
    }

    const projectId = activeProject.zzz_id;

    // Get categories for this project using service
    const categories = await ProductService.getCategoriesByProject(db, projectId);

    if (categories.length === 0) {
      return c.json([], HTTP_OK);
    }

    const categoryIds = categories.map((cat) => cat.zzz_id);

    // Get products for those categories using service
    const items = await ProductService.getProductsByCategoryIds(db, categoryIds);

    const mapped = ProductService.mapProductsWithCategories(items, categories, projectId);
    return c.json(mapped, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching services", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as servicesRouter };
