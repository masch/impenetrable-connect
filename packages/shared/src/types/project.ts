import { z } from "zod";
import { LanguageSchema } from "./common";

export const ProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  default_language: LanguageSchema.default("es"),
  supported_languages: z.array(LanguageSchema).default(["es"]),
  cascade_timeout_minutes: z.number().int().positive().default(30),
  max_cascade_attempts: z.number().int().positive().default(10),
  is_active: z.boolean().default(true),
});

export interface Project extends z.infer<typeof ProjectSchema> {}
