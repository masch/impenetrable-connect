import { z } from "zod";

export const VentureMemberSchema = z.object({
  id: z.number().int().positive(),
  venture_id: z.number().int().positive(),
  user_id: z.string().uuid(),
  role: z.string().default("MANAGER"),
});

export interface VentureMember extends z.infer<typeof VentureMemberSchema> {}
