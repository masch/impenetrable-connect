/**
 * Mock data for tourist services catalog
 * Uses @repo/shared types aligned with OpenSpec Catalog_Item entity
 */

import { CatalogItem, CatalogType } from "@repo/shared";
import { MOCK_PROJECTS, PROJECT_IDS } from "./projects";

// Get the first active project for our mock catalog types
const defaultProject = MOCK_PROJECTS.find((p) => p.is_active) || MOCK_PROJECTS[0];

// Catalog type IDs - explicit constants for type safety
export const CATALOG_TYPE_IDS = {
  GASTRONOMY: 1,
  EXCURSION: 2,
} as const;

// Catalog Types - referenced by catalog_type_id
export const MOCK_CATALOG_TYPES: CatalogType[] = [
  {
    id: CATALOG_TYPE_IDS.GASTRONOMY,
    project_id: PROJECT_IDS.IMPENETRABLE,
    project: defaultProject,
    name_i18n: { es: "Gastronomía", en: "Gastronomy" },
    description_i18n: {
      es: "Comidas y platos típicos del Chaco",
      en: "Typical Chaco dishes and meals",
    },
    is_active: true,
  },
  {
    id: CATALOG_TYPE_IDS.EXCURSION,
    project_id: PROJECT_IDS.IMPENETRABLE,
    project: defaultProject,
    name_i18n: { es: "Excursiones", en: "Excursions" },
    description_i18n: {
      es: "Actividades turísticas y guiadas",
      en: "Tourist and guided activities",
    },
    is_active: true,
  },
];

// Catalog Items - each has catalog_type_id referencing CatalogType
export const MOCK_CATALOG_FORST_STEW: CatalogItem = {
  id: 1,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Guiso de Monte", en: "Forest Stew" },
  description_i18n: {
    es: "Auténtico guiso tradicional chaqueño preparado con ingredientes locales.",
    en: "Traditional Chaco stew made with local ingredients.",
  },
  price: 2500,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
  global_pause: false,
};

export const MOCK_CATALOG_RIVER_EXCURSION: CatalogItem = {
  id: 3,
  catalog_type_id: CATALOG_TYPE_IDS.EXCURSION,
  name_i18n: { es: "Excursión por el Río", en: "River Excursion" },
  description_i18n: {
    es: "Navegación por el río Paraguay en canoa tradicional.",
    en: "Navigate the Paraguay River in a traditional canoe.",
  },
  price: 4500,
  max_participants: 8,
  image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  global_pause: false,
};

export const MOCK_CATALOG_REGIONAL_GRILL: CatalogItem = {
  id: 2,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Parrillada Regional", en: "Regional Grill" },
  description_i18n: {
    es: "Variedad de carnes asadas a la parrilla del Chaco.",
    en: "Assorted grilled meats from the Chaco.",
  },
  price: 3500,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400",
  global_pause: false,
};

export const MOCK_CATALOG_ITEMS: CatalogItem[] = [
  MOCK_CATALOG_FORST_STEW,
  MOCK_CATALOG_REGIONAL_GRILL,
  MOCK_CATALOG_RIVER_EXCURSION,
];

// Derive additional UI fields from CatalogItem
export type CatalogServiceItem = CatalogItem & {
  schedule?: string;
};

export const MOCK_CATALOG_SERVICES: CatalogServiceItem[] = MOCK_CATALOG_ITEMS.map((item) => ({
  ...item,
  schedule:
    item.catalog_type_id === CATALOG_TYPE_IDS.GASTRONOMY
      ? "12:00 - 16:00"
      : "08:00 - 12:00 / 15:00 - 19:00",
}));
