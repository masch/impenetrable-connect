import { Hono } from "hono";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { logger } from "../services/logger.service";
import { ProductService } from "../services/product.service";
import { HTTP_OK, HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../constants/http-status";

const MIN_VALID_PROJECT_ID = 1;

const router = new Hono<AppEnv>();

router.use("*", authMiddleware);

/**
 * GET /v1/products
 * Returns products with their category for a given project.
 * The products belong to categories that belong to the project.
 * Query param: projectId (number, required) — project to filter by
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;
    const projectId = Number(c.req.query("projectId"));

    if (Number.isNaN(projectId) || projectId < MIN_VALID_PROJECT_ID) {
      return c.json({ error: "Invalid project ID" }, HTTP_BAD_REQUEST);
    }

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
    logger.error("Error fetching products", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as productsRouter };
