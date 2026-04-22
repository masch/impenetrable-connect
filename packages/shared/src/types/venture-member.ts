import { z } from "zod";

export const VentureMemberSchema = z.object({
  id: z.number().int().positive(),
  ventureId: z.number().int().positive(),
  userId: z.string().uuid(),
  role: z.string().default("MANAGER"),
});

export interface VentureMember extends z.infer<typeof VentureMemberSchema> {}
