import { z } from "zod";
import { CatalogTypeSchema } from "./catalog-type";

export const VentureSchema = z.object({
  id: z.number().int().positive(),
  catalog_type_id: z.number().int().positive(),
  catalog_type: CatalogTypeSchema.optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  image_url: z.string().url().optional(),
  role_type_id: z.number().int().positive(),
  cascade_order: z.number().int().nonnegative().default(1),
  max_capacity: z.number().int().positive(),
  is_paused: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export interface Venture extends z.infer<typeof VentureSchema> {}
