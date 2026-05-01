/**
 * Mock data for tourist services catalog
 * Uses @repo/shared types aligned with OpenSpec Catalog_Item entity
 */

import { CatalogItem, ServiceCategory, Project, MOCK_PROJECTS, PROJECT_IDS } from "@repo/shared";

// Local assets
import empanadas12 from "../../assets/catalog/empanadas12.jpeg";
import empanadas6 from "../../assets/catalog/empanadas6.jpeg";
import repollo from "../../assets/catalog/repollo.jpeg";
import pastelCalabaza from "../../assets/catalog/pastel_calabaza.jpeg";
import chivoGuiso from "../../assets/catalog/chivo_guiso.jpeg";
import chivoEstofado from "../../assets/catalog/chivo_estofado.jpeg";

// Get the first active project for our mock catalog types
const defaultProject = MOCK_PROJECTS.find((p: Project) => p.zzz_is_active) || MOCK_PROJECTS[0];

// Service category IDs - explicit constants for type safety
export const SERVICE_CATEGORY_IDS = {
  GASTRONOMY: 1,
  EXCURSION: 2,
} as const;

// Service Categories - referenced by catalog_category_id
export const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    zzz_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_project_id: PROJECT_IDS.IMPENETRABLE,
    zzz_project: defaultProject,
    zzz_name_i18n: { es: "Gastronomía", en: "Gastronomy" },
    zzz_description_i18n: {
      es: "Comidas y platos típicos del Chaco",
      en: "Typical Chaco dishes and meals",
    },
    zzz_is_active: true,
  },
  {
    zzz_id: SERVICE_CATEGORY_IDS.EXCURSION,
    zzz_project_id: PROJECT_IDS.IMPENETRABLE,
    zzz_project: defaultProject,
    zzz_name_i18n: { es: "Excursiones", en: "Excursions" },
    zzz_description_i18n: {
      es: "Actividades turísticas y guiadas",
      en: "Tourist and guided activities",
    },
    zzz_is_active: true,
  },
];

// Catalog Items as named exports (zzz_id is a number)
export const EMPANADAS_CARNE_MEDIA_DOCENA: CatalogItem = {
  zzz_id: 1,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de carne 1/2 docena", en: "Beef Empanadas 1/2 dozen" },
  zzz_description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de carne magra, masa casera",
    en: "Minimum 6 empanadas. Lean beef empanadas, homemade dough",
  },
  zzz_price: 9500,
  zzz_max_participants: 20,
  zzz_image_url: empanadas6,
  zzz_global_pause: false,
};

export const EMPANADAS_CARNE_DOCENA: CatalogItem = {
  zzz_id: 2,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de carne 1 docena", en: "Beef Empanadas dozen" },
  zzz_description_i18n: {
    es: "Empanadas de carne magra, masa casera",
    en: "Lean beef empanadas, homemade dough",
  },
  zzz_price: 18000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas12,
  zzz_global_pause: false,
};

export const EMPANADAS_CHARQUI_MEDIA_DOCENA: CatalogItem = {
  zzz_id: 3,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de charqui 1/2 docena", en: "Charqui Empanadas 1/2 dozen" },
  zzz_description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de charqui artesanal",
    en: "Minimum 6 empanadas. Artisan charqui empanadas",
  },
  zzz_price: 12500,
  zzz_max_participants: 20,
  zzz_image_url: empanadas6,
  zzz_global_pause: false,
};

export const EMPANADAS_CHARQUI_DOCENA: CatalogItem = {
  zzz_id: 4,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de charqui 1 docena", en: "Charqui Empanadas dozen" },
  zzz_description_i18n: { es: "Empanadas de charqui artesanal", en: "Artisan charqui empanadas" },
  zzz_price: 24000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas12,
  zzz_global_pause: false,
};

export const EMPANADAS_VERDURA_MEDIA_DOCENA: CatalogItem = {
  zzz_id: 5,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de verdura 1/2 docena", en: "Vegetable Empanadas 1/2 dozen" },
  zzz_description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de verduras frescas de la huerta",
    en: "Minimum 6 empanadas. Fresh garden vegetable empanadas",
  },
  zzz_price: 9000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas12,
  zzz_global_pause: false,
};

export const EMPANADAS_VERDURA_DOCENA: CatalogItem = {
  zzz_id: 6,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de verdura 1 docena", en: "Vegetable Empanadas dozen" },
  zzz_description_i18n: {
    es: "Empanadas de verduras frescas de la huerta",
    en: "Fresh garden vegetable empanadas",
  },
  zzz_price: 17000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas12,
  zzz_global_pause: false,
};

export const EMPANADAS_POLLO_MEDIA_DOCENA: CatalogItem = {
  zzz_id: 7,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de pollo 1/2 docena", en: "Chicken Empanadas 1/2 dozen" },
  zzz_description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de pollo deshilachado",
    en: "Minimum 6 empanadas. Shredded chicken empanadas",
  },
  zzz_price: 9000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas6,
  zzz_global_pause: false,
};

export const EMPANADAS_POLLO_DOCENA: CatalogItem = {
  zzz_id: 8,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Empanadas de pollo 1 docena", en: "Chicken Empanadas dozen" },
  zzz_description_i18n: { es: "Empanadas de pollo deshilachado", en: "Shredded chicken empanadas" },
  zzz_price: 17000,
  zzz_max_participants: 20,
  zzz_image_url: empanadas12,
  zzz_global_pause: false,
};

export const ASADO_POLLO: CatalogItem = {
  zzz_id: 9,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Asado de pollo c/guarnición", en: "Roasted chicken with garnish" },
  zzz_description_i18n: {
    es: "Asado de pollo con guarnición de arroz y ensalada",
    en: "Roasted chicken with rice and salad garnish",
  },
  zzz_price: 17000,
  zzz_max_participants: 20,
  zzz_image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
  zzz_global_pause: false,
};

export const PASTEL_ZAPALLO_CHIVO: CatalogItem = {
  zzz_id: 10,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Pastel de zapallo o papa c/chivo", en: "Pumpkin or potato pie with goat" },
  zzz_description_i18n: {
    es: "Pastel de zapallo o papa con carne de chivo",
    en: "Pumpkin or potato pie with goat meat",
  },
  zzz_price: 18000,
  zzz_max_participants: 20,
  zzz_image_url: pastelCalabaza,
  zzz_global_pause: false,
};

export const ESTOFADO_CHIVO: CatalogItem = {
  zzz_id: 11,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Estofado de chivo", en: "Goat stew" },
  zzz_description_i18n: {
    es: "Estofado tradicional de chivo chaqueño",
    en: "Traditional Chaco goat stew",
  },
  zzz_price: 20000,
  zzz_max_participants: 20,
  zzz_image_url: chivoEstofado,
  zzz_global_pause: false,
};

export const GUISO_CHIVO: CatalogItem = {
  zzz_id: 12,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Guiso de Chivo", en: "Goat stew (Guiso)" },
  zzz_description_i18n: {
    es: "Guiso auténtica de chivo chaqueño",
    en: "Authentic Chaco goat guiso",
  },
  zzz_price: 20000,
  zzz_max_participants: 20,
  zzz_image_url: chivoGuiso,
  zzz_global_pause: false,
};

export const REPOLLO_ASADO: CatalogItem = {
  zzz_id: 13,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Repollo asado c/verduras", en: "Roasted cabbage with vegetables" },
  zzz_description_i18n: {
    es: "Repollo asado con mezcla de verduras de temporada",
    en: "Roasted cabbage with seasonal vegetables",
  },
  zzz_price: 18000,
  zzz_max_participants: 20,
  zzz_image_url: repollo,
  zzz_global_pause: false,
};

export const POSTRE_REGIONAL: CatalogItem = {
  zzz_id: 14,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Postre regional", en: "Regional dessert" },
  zzz_description_i18n: {
    es: "Postre típico de la región chaqueña",
    en: "Typical dessert from the Chaco region",
  },
  zzz_price: 7000,
  zzz_max_participants: 20,
  zzz_image_url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400",
  zzz_global_pause: false,
};

export const DESAYUNO: CatalogItem = {
  zzz_id: 15,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Desayuno", en: "Breakfast tea" },
  zzz_description_i18n: {
    es: "Desayuno con productos regionales",
    en: "Breakfast with regional products",
  },
  zzz_price: 9000,
  zzz_max_participants: 20,
  zzz_image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  zzz_global_pause: false,
};

export const MERIENDA: CatalogItem = {
  zzz_id: 16,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  zzz_name_i18n: { es: "Merienda", en: "Snack" },
  zzz_description_i18n: {
    es: "Merienda con productos regionales",
    en: "Snack with regional products",
  },
  zzz_price: 9000,
  zzz_max_participants: 20,
  zzz_image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  zzz_global_pause: false,
};

export const PASEO_LANCHA: CatalogItem = {
  zzz_id: 17,
  zzz_catalog_category_id: SERVICE_CATEGORY_IDS.EXCURSION,
  zzz_name_i18n: { es: "Paseo en lancha", en: "Boat trip" },
  zzz_description_i18n: {
    es: "Paseo guiado por el río Bermejito",
    en: "Guided boat trip on the Bermejito river",
  },
  zzz_price: 15000,
  zzz_max_participants: 6,
  zzz_image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  zzz_global_pause: false,
};

export const MOCK_CATALOG_ITEMS: Record<number, CatalogItem> = {
  [EMPANADAS_CARNE_MEDIA_DOCENA.zzz_id]: EMPANADAS_CARNE_MEDIA_DOCENA,
  [EMPANADAS_CARNE_DOCENA.zzz_id]: EMPANADAS_CARNE_DOCENA,
  [EMPANADAS_CHARQUI_MEDIA_DOCENA.zzz_id]: EMPANADAS_CHARQUI_MEDIA_DOCENA,
  [EMPANADAS_CHARQUI_DOCENA.zzz_id]: EMPANADAS_CHARQUI_DOCENA,
  [EMPANADAS_VERDURA_MEDIA_DOCENA.zzz_id]: EMPANADAS_VERDURA_MEDIA_DOCENA,
  [EMPANADAS_VERDURA_DOCENA.zzz_id]: EMPANADAS_VERDURA_DOCENA,
  [EMPANADAS_POLLO_MEDIA_DOCENA.zzz_id]: EMPANADAS_POLLO_MEDIA_DOCENA,
  [EMPANADAS_POLLO_DOCENA.zzz_id]: EMPANADAS_POLLO_DOCENA,
  [ASADO_POLLO.zzz_id]: ASADO_POLLO,
  [PASTEL_ZAPALLO_CHIVO.zzz_id]: PASTEL_ZAPALLO_CHIVO,
  [ESTOFADO_CHIVO.zzz_id]: ESTOFADO_CHIVO,
  [GUISO_CHIVO.zzz_id]: GUISO_CHIVO,
  [REPOLLO_ASADO.zzz_id]: REPOLLO_ASADO,
  [POSTRE_REGIONAL.zzz_id]: POSTRE_REGIONAL,
  [DESAYUNO.zzz_id]: DESAYUNO,
  [MERIENDA.zzz_id]: MERIENDA,
  [PASEO_LANCHA.zzz_id]: PASEO_LANCHA,
};

// Derive additional UI fields from CatalogItem
export type CatalogServiceItem = CatalogItem;

export const MOCK_CATALOG_SERVICES: CatalogServiceItem[] = Object.values(MOCK_CATALOG_ITEMS);
