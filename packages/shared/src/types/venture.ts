import { z } from "zod";
import { VentureMemberSchema } from "./venture-member";

export const VentureSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(255),
  ownerId: z.string().uuid(),
  zzz_max_capacity: z.number().int().default(0),
  zzz_cascade_order: z.number().int().default(0),
  zzz_is_paused: z.boolean().default(false),
  zzz_is_active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  zzz_members: z.array(VentureMemberSchema).optional(),
});

export type Venture = z.infer<typeof VentureSchema>;

export const CreateVentureSchema = VentureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateVentureInput = z.infer<typeof CreateVentureSchema>;
