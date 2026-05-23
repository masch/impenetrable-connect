import { and, eq, inArray } from "drizzle-orm";
import { type Db } from "../db";
import { products, productCategories } from "../db/schema";
import { type ProductSelect } from "../db/schema/products";
import { type ProductCategorySelect } from "../db/schema/product-categories";

export interface ProductResponse {
  zzz_id: number;
  zzz_product_category_id: number;
  zzz_name_i18n: Record<string, string>;
  zzz_description_i18n?: Record<string, string>;
  zzz_price: number;
  zzz_max_participants: number;
  zzz_image_url?: string;
  zzz_global_pause: boolean;
  zzz_service_moments?: string[];
  zzz_category?: {
    zzz_id: number;
    zzz_project_id: number;
    zzz_name_i18n: Record<string, string>;
    zzz_description_i18n?: Record<string, string>;
    zzz_is_active: boolean;
  };
}

/**
 * Maps DB products + categories to the standardized Product response format.
 * Shared between GET /v1/products/project/:projectId and GET /v1/services.
 */
export function mapProductsWithCategories(
  items: ProductSelect[],
  categories: ProductCategorySelect[],
  projectId: number,
): ProductResponse[] {
  const categoryMap = new Map(categories.map((cat) => [cat.zzz_id, cat]));

  return items.map((item) => ({
    zzz_id: item.zzz_id,
    zzz_product_category_id: item.zzz_product_category_id,
    zzz_name_i18n: item.zzz_name_i18n,
    zzz_description_i18n: item.zzz_description_i18n ?? undefined,
    zzz_price: Number(item.zzz_price),
    zzz_max_participants: item.zzz_max_participants,
    zzz_image_url: item.zzz_image_url ?? undefined,
    zzz_global_pause: item.zzz_global_pause,
    zzz_service_moments: item.zzz_service_moments ?? undefined,
    zzz_category: categoryMap.has(item.zzz_product_category_id)
      ? {
          zzz_id: item.zzz_product_category_id,
          zzz_project_id: projectId,
          zzz_name_i18n: categoryMap.get(item.zzz_product_category_id)!.zzz_name_i18n,
          zzz_description_i18n:
            categoryMap.get(item.zzz_product_category_id)!.zzz_description_i18n ?? undefined,
          zzz_is_active: true,
        }
      : undefined,
  }));
}

export class ProductService {
  /**
   * Retrieves active categories for a project.
   */
  static async getCategoriesByProject(db: Db, projectId: number) {
    return db
      .select()
      .from(productCategories)
      .where(
        and(
          eq(productCategories.zzz_project_id, projectId),
          eq(productCategories.zzz_is_active, true),
        ),
      );
  }

  /**
   * Retrieves active products for a list of category IDs.
   */
  static async getProductsByCategoryIds(db: Db, categoryIds: number[]) {
    return db
      .select()
      .from(products)
      .where(
        and(
          inArray(products.zzz_product_category_id, categoryIds),
          eq(products.zzz_global_pause, false),
        ),
      );
  }

  /**
   * Static exposure of mapProductsWithCategories.
   */
  static mapProductsWithCategories = mapProductsWithCategories;
}
