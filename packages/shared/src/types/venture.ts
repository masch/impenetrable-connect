import { z } from "zod";
import { ServiceCategorySchema } from "./service-category";
import { VentureMemberSchema } from "./venture-member";

/**
 * VentureDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'ventures' table.
 */
export const VentureDbSchema = z.object({
  id: z.number().int().positive(),
  catalog_type_id: z.number().int().positive(),
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

/**
 * VentureSchema (Domain Aggregate)
 * Business entity that includes catalog type and members.
 */
export const VentureSchema = VentureDbSchema.extend({
  categories: z.array(ServiceCategorySchema).optional(),
  members: z.array(VentureMemberSchema).optional(),
});

export type VentureRow = z.infer<typeof VentureDbSchema>;
export interface Venture extends z.infer<typeof VentureSchema> {}
