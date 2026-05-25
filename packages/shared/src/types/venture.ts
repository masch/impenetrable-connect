import { z } from "zod";
import { VentureMemberSchema } from "./venture-member";

const VENTURE_CONSTRAINTS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 255,
} as const;

export const VentureSchema = z.object({
  id: z.number().int(),
  name: z
    .string()
    .min(VENTURE_CONSTRAINTS.NAME_MIN_LENGTH)
    .max(VENTURE_CONSTRAINTS.NAME_MAX_LENGTH),
  ownerId: z.string().uuid(),
  zzz_max_capacity: z.number().int().default(0),
  zzz_cascade_order: z.number().int().default(0),
  zzz_is_paused: z.boolean().default(false),
  zzz_is_active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  zzz_project_id: z.number().int(),
  zzz_product_category_id: z.number().int().positive(),
  zzz_members: z.array(VentureMemberSchema).optional(),
});

export interface Venture extends z.infer<typeof VentureSchema> {}

export const CreateVentureSchema = VentureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface CreateVentureInput extends z.infer<typeof CreateVentureSchema> {}

export const UpdateVentureSchema = VentureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  zzz_project_id: true,
  ownerId: true,
  zzz_members: true,
}).partial();

export interface UpdateVentureInput extends z.infer<typeof UpdateVentureSchema> {}
