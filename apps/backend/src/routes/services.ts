import { Hono } from "hono";
import { eq, and, inArray } from "drizzle-orm";
import { products, productCategories, projects } from "../db/schema";
import { type AppEnv } from "../config/env";
import { logger } from "../services/logger.service";
import { mapProductsWithCategories } from "../services/product.service";

const router = new Hono<AppEnv>();

/**
 * GET /v1/services
 * Returns all products for the first active project.
 * Public endpoint — no auth required since the product catalog is browsable.
 */
router.get("/", async (c) => {
  try {
    const db = c.var.db;

    // Find the first active project
    const [activeProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.zzz_is_active, true))
      .orderBy(projects.zzz_id)
      .limit(1);

    if (!activeProject) {
      return c.json([]);
    }

    const projectId = activeProject.zzz_id;

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
    logger.error("Error fetching services", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { router as servicesRouter };
