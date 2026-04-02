import { Project } from "@repo/shared";

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Impenetrable Connect",
    default_language: "es",
    supported_languages: ["es", "en"],
    cascade_timeout_minutes: 30,
    max_cascade_attempts: 10,
    is_active: true,
  },
  {
    id: 2,
    name: "Iberá Discovery",
    default_language: "en",
    supported_languages: ["es", "en"],
    cascade_timeout_minutes: 60,
    max_cascade_attempts: 5,
    is_active: false,
  },
];
