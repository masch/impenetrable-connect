import { z } from "zod";
import { I18nStringSchema } from "./common";
import { ProjectSchema } from "./project";

export const CatalogTypeSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  project: ProjectSchema,
  name_i18n: I18nStringSchema,
  description_i18n: I18nStringSchema.optional(),
  is_active: z.boolean().default(true),
});

// Schema for creating a new catalog type (without id and project relation)
export const CreateCatalogTypeSchema = CatalogTypeSchema.omit({ id: true, project: true }).extend({
  project_id: z.number().int().positive(),
});

export interface CatalogType extends z.infer<typeof CatalogTypeSchema> {}

export interface CreateCatalogTypeInput extends z.input<typeof CreateCatalogTypeSchema> {}
