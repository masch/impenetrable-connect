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

export const isValidTimezone = (tz: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// Define the core project fields without ID
const projectFields = {
  zzz_name: z
    .string()
    .min(PROJECT_CONSTRAINTS.NAME_MIN_LENGTH)
    .max(PROJECT_CONSTRAINTS.NAME_MAX_LENGTH),
  zzz_default_language: LanguageSchema.default("es"),
  zzz_supported_languages: z.array(LanguageSchema).min(1).default(["es"]),
  zzz_cascade_timeout_minutes: z
    .number()
    .int()
    .min(PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MIN)
    .max(PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MAX)
    .default(30),
  zzz_max_cascade_attempts: z
    .number()
    .int()
    .min(PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MIN)
    .max(PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MAX)
    .default(10),
  zzz_is_active: z.boolean().default(true),
  zzz_timezone: z.string().refine(isValidTimezone, {
    message: "Invalid IANA timezone identifier",
  }),
};

// Common validation logic for languages
const validateProjectLanguages = (data: {
  zzz_default_language: string;
  zzz_supported_languages: string[];
}) => data.zzz_supported_languages.includes(data.zzz_default_language);

const languageErrorMessage = {
  message: "Default language must be one of the supported languages",
  path: ["zzz_default_language"],
};

// Schema for creating a new project (without id)
export const CreateProjectSchema = z
  .object(projectFields)
  .refine(validateProjectLanguages, languageErrorMessage);

// Base schema for existing projects
export const ProjectSchema = z
  .object({
    zzz_id: z.number().int().positive(),
    ...projectFields,
  })
  .refine(validateProjectLanguages, languageErrorMessage);

// Schema for updating a project (all fields optional)
export const UpdateProjectSchema = z
  .object(projectFields)
  .partial()
  .refine(
    (data) => {
      if (data.zzz_supported_languages && data.zzz_default_language) {
        return data.zzz_supported_languages.includes(data.zzz_default_language);
      }
      return true;
    },
    {
      message: "Default language must be one of the supported languages",
      path: ["zzz_default_language"],
    },
  );

export interface Project extends z.infer<typeof ProjectSchema> {}
export interface CreateProjectInput extends z.input<typeof CreateProjectSchema> {}
export interface UpdateProjectInput extends z.input<typeof UpdateProjectSchema> {}
