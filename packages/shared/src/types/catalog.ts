import { z } from "zod";
import { I18nStringSchema } from "./common";
import { CatalogTypeSchema } from "./catalog-type";

export const CatalogItemSchema = z.object({
  id: z.number().int().positive(),
  catalog_type_id: z.number().int().positive(),
  catalog_type: CatalogTypeSchema.optional(),
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
