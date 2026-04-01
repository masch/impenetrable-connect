import { z } from "zod";
import { ProjectSchema } from "./project";

export const CatalogTypeSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  project: ProjectSchema.optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export interface CatalogType extends z.infer<typeof CatalogTypeSchema> {}
