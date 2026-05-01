import { z } from "zod";
import { I18nStringSchema } from "./common";
import { ServiceCategorySchema } from "./service-category";

export const CatalogItemSchema = z.object({
  zzz_id: z.number().int().positive(),
  zzz_catalog_category_id: z.number().int().positive(),
  zzz_category: ServiceCategorySchema.optional(),
  zzz_name_i18n: I18nStringSchema,
  zzz_description_i18n: I18nStringSchema.optional(),
  zzz_allergens_i18n: I18nStringSchema.optional(),
  zzz_ingredients_i18n: I18nStringSchema.optional(),
  zzz_price: z.number().nonnegative(),
  zzz_max_participants: z.number().int().positive(),
  zzz_image_url: z.union([z.string(), z.number()]).optional(),
  zzz_global_pause: z.boolean().default(false),
});

// Infer TypeScript type directly from the Zod Schema
export interface CatalogItem extends z.infer<typeof CatalogItemSchema> {}
