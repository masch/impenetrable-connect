import type { Project } from "../types/project";

// Project IDs - explicit constants for type safety
export const PROJECT_IDS = {
  IMPENETRABLE: 1,
  IBERA: 2,
  PATAGONIA: 3,
  PATAGONIA_AZUL: 4,
} as const;

// Get project by ID helper
export const getProjectById = (id: number): Project | undefined =>
  MOCK_PROJECTS.find((p) => p.zzz_id === id);

// Get default (active) project
export const getDefaultProject = (): Project =>
  MOCK_PROJECTS.find((p) => p.zzz_is_active) || MOCK_PROJECTS[0];

export const MOCK_PROJECTS: Project[] = [
  {
    zzz_id: PROJECT_IDS.IMPENETRABLE,
    zzz_name: "El Impenetrable",
    zzz_default_language: "es",
    zzz_supported_languages: ["es", "en"],
    zzz_cascade_timeout_minutes: 30,
    zzz_max_cascade_attempts: 10,
    zzz_is_active: true,
    zzz_timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: PROJECT_IDS.IBERA,
    zzz_name: "Parque Iberá",
    zzz_default_language: "es",
    zzz_supported_languages: ["es", "en"],
    zzz_cascade_timeout_minutes: 60,
    zzz_max_cascade_attempts: 5,
    zzz_is_active: false,
    zzz_timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: PROJECT_IDS.PATAGONIA,
    zzz_name: "Parque Patagonia",
    zzz_default_language: "es",
    zzz_supported_languages: ["es", "en"],
    zzz_cascade_timeout_minutes: 45,
    zzz_max_cascade_attempts: 8,
    zzz_is_active: false,
    zzz_timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: PROJECT_IDS.PATAGONIA_AZUL,
    zzz_name: "Parque Patagonia Azul",
    zzz_default_language: "es",
    zzz_supported_languages: ["es", "en"],
    zzz_cascade_timeout_minutes: 45,
    zzz_max_cascade_attempts: 8,
    zzz_is_active: false,
    zzz_timezone: "America/Argentina/Buenos_Aires",
  },
];
