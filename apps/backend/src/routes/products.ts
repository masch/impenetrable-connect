import { Hono } from "hono";
import { eq, and, inArray } from "drizzle-orm";
import { products, productCategories } from "../db/schema";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { logger } from "../services/logger.service";
import { mapProductsWithCategories } from "../services/product.service";

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

    if (Number.isNaN(projectId) || projectId < 1) {
      return c.json({ error: "Invalid project ID" }, 400);
    }

    // Get categories for this project
    const categories = await db
      .select()
      .from(productCategories)
      .where(
        and(
          eq(productCategories.zzz_project_id, projectId),
          eq(productCategories.zzz_is_active, true),
        ),
      );

    if (categories.length === 0) {
      return c.json([]);
    }

    const categoryIds = categories.map((cat) => cat.zzz_id);

    // Get products for those categories
    const items = await db
      .select()
      .from(products)
      .where(
        and(
          inArray(products.zzz_product_category_id, categoryIds),
          eq(products.zzz_global_pause, false),
        ),
      );

    return c.json(mapProductsWithCategories(items, categories, projectId));
  } catch (error) {
    logger.error("Error fetching products", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { router as productsRouter };
