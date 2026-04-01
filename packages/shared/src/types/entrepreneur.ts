import { z } from "zod";
import { UserRoleSchema } from "./common";

export const EntrepreneurSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  whatsapp: z.string().optional(),
  user_type: UserRoleSchema.default("ENTREPRENEUR"),
  is_active: z.boolean().default(true),
  last_login_at: z.date().optional(),
  created_at: z.date(),
});

export interface Entrepreneur extends z.infer<typeof EntrepreneurSchema> {}
