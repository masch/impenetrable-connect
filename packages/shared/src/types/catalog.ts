import { z } from "zod";
import { I18nStringSchema } from "./common";
import { ServiceCategorySchema } from "./service-category";

export const CatalogItemSchema = z.object({
  id: z.number().int().positive(),
  catalog_category_id: z.number().int().positive(),
  category: ServiceCategorySchema.optional(),
  name_i18n: I18nStringSchema,
  description_i18n: I18nStringSchema.optional(),
  allergens_i18n: I18nStringSchema.optional(),
  ingredients_i18n: I18nStringSchema.optional(),
  price: z.number().nonnegative(),
  max_participants: z.number().int().positive().nullable(),
  image_url: z.string().url().optional(),
  global_pause: z.boolean().default(false),
});

// Infer TypeScript type directly from the Zod Schema
export interface CatalogItem extends z.infer<typeof CatalogItemSchema> {}
