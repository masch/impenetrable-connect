import { Project } from "@repo/shared";

// Project IDs - explicit constants for type safety
export const PROJECT_IDS = {
  IMPENETRABLE: 1,
  IBERA: 2,
} as const;

// Get project by ID helper
export const getProjectById = (id: number): Project | undefined =>
  MOCK_PROJECTS.find((p) => p.id === id);

// Get default (active) project
export const getDefaultProject = (): Project =>
  MOCK_PROJECTS.find((p) => p.is_active) || MOCK_PROJECTS[0];

export const MOCK_PROJECTS: Project[] = [
  {
    id: PROJECT_IDS.IMPENETRABLE,
    name: "Impenetrable Connect",
    default_language: "es",
    supported_languages: ["es", "en"],
    cascade_timeout_minutes: 30,
    max_cascade_attempts: 10,
    is_active: true,
  },
  {
    id: PROJECT_IDS.IBERA,
    name: "Iberá Discovery",
    default_language: "en",
    supported_languages: ["es", "en"],
    cascade_timeout_minutes: 60,
    max_cascade_attempts: 5,
    is_active: false,
  },
];
