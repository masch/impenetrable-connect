import { z } from "zod";
import { I18nStringSchema } from "./common";
import { ProjectSchema } from "./project";

export const ServiceCategorySchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  project: ProjectSchema,
  name_i18n: I18nStringSchema,
  description_i18n: I18nStringSchema.optional(),
  is_active: z.boolean().default(true),
});

// Schema for creating a new service category (without id and project relation)
export const CreateServiceCategorySchema = ServiceCategorySchema.omit({
  id: true,
  project: true,
}).extend({
  project_id: z.number().int().positive(),
});

export interface ServiceCategory extends z.infer<typeof ServiceCategorySchema> {}

export interface CreateServiceCategoryInput extends z.input<typeof CreateServiceCategorySchema> {}
