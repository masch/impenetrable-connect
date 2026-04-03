import { z } from "zod";
import { LanguageSchema } from "./common";

export const PROJECT_CONSTRAINTS = {
  MAX_CASCADE_ATTEMPTS_MIN: 1,
  MAX_CASCADE_ATTEMPTS_MAX: 10,
  CASCADE_TIMEOUT_MINUTES_MIN: 1,
  CASCADE_TIMEOUT_MINUTES_MAX: 120,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const;

export const ProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(PROJECT_CONSTRAINTS.NAME_MIN_LENGTH)
    .max(PROJECT_CONSTRAINTS.NAME_MAX_LENGTH),
  default_language: LanguageSchema.default("es"),
  supported_languages: z.array(LanguageSchema).min(1).default(["es"]),
  cascade_timeout_minutes: z
    .number()
    .int()
    .min(PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MIN)
    .max(PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MAX)
    .default(30),
  max_cascade_attempts: z
    .number()
    .int()
    .min(PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MIN)
    .max(PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MAX)
    .default(10),
  is_active: z.boolean().default(true),
});

// Schema for creating a new project (without id)
export const CreateProjectSchema = ProjectSchema.omit({ id: true });

// Schema for updating a project (all fields optional)
export const UpdateProjectSchema = CreateProjectSchema.partial();

export interface Project extends z.infer<typeof ProjectSchema> {}

export interface CreateProjectInput extends z.infer<typeof CreateProjectSchema> {}

export interface UpdateProjectInput extends z.infer<typeof UpdateProjectSchema> {}
