/**
 * Mock data for tourist services catalog
 * Uses @repo/shared types aligned with OpenSpec Catalog_Item entity
 */

import { CatalogItem, CatalogType } from "@repo/shared";
import { MOCK_PROJECTS, PROJECT_IDS } from "./projects";

// Local assets
import empanadas12 from "../../assets/catalog/empanadas12.jpeg";
import empanadas6 from "../../assets/catalog/empanadas6.jpeg";
import repollo from "../../assets/catalog/repollo.jpeg";
import pastelCalabaza from "../../assets/catalog/pastel_calabaza.jpeg";
import chivoGuiso from "../../assets/catalog/chivo_guiso.jpeg";
import chivoEstofado from "../../assets/catalog/chivo_estofado.jpeg";

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

// Catalog Items as named exports (id is a number)
export const EMPANADAS_CARNE_MEDIA_DOCENA: CatalogItem = {
  id: 1,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de carne 1/2 docena", en: "Beef Empanadas 1/2 dozen" },
  description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de carne magra, masa casera",
    en: "Minimum 6 empanadas. Lean beef empanadas, homemade dough",
  },
  price: 9500,
  max_participants: null,
  image_url: empanadas6 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_CARNE_DOCENA: CatalogItem = {
  id: 2,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de carne 1 docena", en: "Beef Empanadas dozen" },
  description_i18n: {
    es: "Empanadas de carne magra, masa casera",
    en: "Lean beef empanadas, homemade dough",
  },
  price: 18000,
  max_participants: null,
  image_url: empanadas12 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_CHARQUI_MEDIA_DOCENA: CatalogItem = {
  id: 3,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de charqui 1/2 docena", en: "Charqui Empanadas 1/2 dozen" },
  description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de charqui artesanal",
    en: "Minimum 6 empanadas. Artisan charqui empanadas",
  },
  price: 12500,
  max_participants: null,
  image_url: empanadas6 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_CHARQUI_DOCENA: CatalogItem = {
  id: 4,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de charqui 1 docena", en: "Charqui Empanadas dozen" },
  description_i18n: { es: "Empanadas de charqui artesanal", en: "Artisan charqui empanadas" },
  price: 24000,
  max_participants: null,
  image_url: empanadas12 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_VERDURA_MEDIA_DOCENA: CatalogItem = {
  id: 5,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de verdura 1/2 docena", en: "Vegetable Empanadas 1/2 dozen" },
  description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de verduras frescas de la huerta",
    en: "Minimum 6 empanadas. Fresh garden vegetable empanadas",
  },
  price: 9000,
  max_participants: null,
  image_url: empanadas12 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_VERDURA_DOCENA: CatalogItem = {
  id: 6,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de verdura 1 docena", en: "Vegetable Empanadas dozen" },
  description_i18n: {
    es: "Empanadas de verduras frescas de la huerta",
    en: "Fresh garden vegetable empanadas",
  },
  price: 17000,
  max_participants: null,
  image_url: empanadas12 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_POLLO_MEDIA_DOCENA: CatalogItem = {
  id: 7,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de pollo 1/2 docena", en: "Chicken Empanadas 1/2 dozen" },
  description_i18n: {
    es: "Mínimo 6 empanadas. Empanadas de pollo deshilachado",
    en: "Minimum 6 empanadas. Shredded chicken empanadas",
  },
  price: 9000,
  max_participants: null,
  image_url: empanadas6 as unknown as string,
  global_pause: false,
};

export const EMPANADAS_POLLO_DOCENA: CatalogItem = {
  id: 8,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Empanadas de pollo 1 docena", en: "Chicken Empanadas dozen" },
  description_i18n: { es: "Empanadas de pollo deshilachado", en: "Shredded chicken empanadas" },
  price: 17000,
  max_participants: null,
  image_url: empanadas12 as unknown as string,
  global_pause: false,
};

export const ASADO_POLLO: CatalogItem = {
  id: 9,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Asado de pollo c/guarnición", en: "Roasted chicken with garnish" },
  description_i18n: {
    es: "Asado de pollo con guarnición de arroz y ensalada",
    en: "Roasted chicken with rice and salad garnish",
  },
  price: 17000,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
  global_pause: false,
};

export const PASTEL_ZAPALLO_CHIVO: CatalogItem = {
  id: 10,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Pastel de zapallo o papa c/chivo", en: "Pumpkin or potato pie with goat" },
  description_i18n: {
    es: "Pastel de zapallo o papa con carne de chivo",
    en: "Pumpkin or potato pie with goat meat",
  },
  price: 18000,
  max_participants: null,
  image_url: pastelCalabaza as unknown as string,
  global_pause: false,
};

export const ESTOFADO_CHIVO: CatalogItem = {
  id: 11,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Estofado de chivo", en: "Goat stew" },
  description_i18n: {
    es: "Estofado tradicional de chivo chaqueño",
    en: "Traditional Chaco goat stew",
  },
  price: 20000,
  max_participants: null,
  image_url: chivoEstofado as unknown as string,
  global_pause: false,
};

export const GUISO_CHIVO: CatalogItem = {
  id: 12,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Guiso de Chivo", en: "Goat stew (Guiso)" },
  description_i18n: { es: "Guiso auténtica de chivo chaqueño", en: "Authentic Chaco goat guiso" },
  price: 20000,
  max_participants: null,
  image_url: chivoGuiso as unknown as string,
  global_pause: false,
};

export const REPOLLO_ASADO: CatalogItem = {
  id: 13,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Repollo asado c/verduras", en: "Roasted cabbage with vegetables" },
  description_i18n: {
    es: "Repollo asado con mezcla de verduras de temporada",
    en: "Roasted cabbage with seasonal vegetables",
  },
  price: 18000,
  max_participants: null,
  image_url: repollo as unknown as string,
  global_pause: false,
};

export const POSTRE_REGIONAL: CatalogItem = {
  id: 14,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Postre regional", en: "Regional dessert" },
  description_i18n: {
    es: "Postre típico de la región chaqueña",
    en: "Typical dessert from the Chaco region",
  },
  price: 7000,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400",
  global_pause: false,
};

export const DESAYUNO: CatalogItem = {
  id: 15,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Desayuno", en: "Breakfast tea" },
  description_i18n: {
    es: "Desayuno con productos regionales",
    en: "Breakfast with regional products",
  },
  price: 9000,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  global_pause: false,
};

export const MERIENDA: CatalogItem = {
  id: 16,
  catalog_type_id: CATALOG_TYPE_IDS.GASTRONOMY,
  name_i18n: { es: "Merienda", en: "Snack" },
  description_i18n: {
    es: "Merienda con productos regionales",
    en: "Snack with regional products",
  },
  price: 9000,
  max_participants: null,
  image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  global_pause: false,
};

export const MOCK_CATALOG_ITEMS: Record<number, CatalogItem> = {
  [EMPANADAS_CARNE_MEDIA_DOCENA.id]: EMPANADAS_CARNE_MEDIA_DOCENA,
  [EMPANADAS_CARNE_DOCENA.id]: EMPANADAS_CARNE_DOCENA,
  [EMPANADAS_CHARQUI_MEDIA_DOCENA.id]: EMPANADAS_CHARQUI_MEDIA_DOCENA,
  [EMPANADAS_CHARQUI_DOCENA.id]: EMPANADAS_CHARQUI_DOCENA,
  [EMPANADAS_VERDURA_MEDIA_DOCENA.id]: EMPANADAS_VERDURA_MEDIA_DOCENA,
  [EMPANADAS_VERDURA_DOCENA.id]: EMPANADAS_VERDURA_DOCENA,
  [EMPANADAS_POLLO_MEDIA_DOCENA.id]: EMPANADAS_POLLO_MEDIA_DOCENA,
  [EMPANADAS_POLLO_DOCENA.id]: EMPANADAS_POLLO_DOCENA,
  [ASADO_POLLO.id]: ASADO_POLLO,
  [PASTEL_ZAPALLO_CHIVO.id]: PASTEL_ZAPALLO_CHIVO,
  [ESTOFADO_CHIVO.id]: ESTOFADO_CHIVO,
  [GUISO_CHIVO.id]: GUISO_CHIVO,
  [REPOLLO_ASADO.id]: REPOLLO_ASADO,
  [POSTRE_REGIONAL.id]: POSTRE_REGIONAL,
  [DESAYUNO.id]: DESAYUNO,
  [MERIENDA.id]: MERIENDA,
};

// Derive additional UI fields from CatalogItem
export type CatalogServiceItem = CatalogItem;

export const MOCK_CATALOG_SERVICES: CatalogServiceItem[] = Object.values(MOCK_CATALOG_ITEMS);
