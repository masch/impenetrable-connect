/**
 * Mock data for tourist services/product catalog.
 * Imports pure data from @repo/shared, patches image_url with local assets.
 */

import {
  type CatalogItem,
  MOCK_PRODUCT_CATEGORIES,
  CATALOG_ITEMS_MAP,
  PRODUCT_CATEGORY_IDS,
} from "@repo/shared";

// Local assets
import empanadas12 from "../../assets/catalog/empanadas12.jpeg";
import empanadas6 from "../../assets/catalog/empanadas6.jpeg";
import empanadasPollo from "../../assets/catalog/empanadas_pollo.jpeg";
import repollo from "../../assets/catalog/repollo.jpeg";
import pastelCalabaza from "../../assets/catalog/pastel_calabaza.jpeg";
import chivoGuiso from "../../assets/catalog/chivo_guiso.jpeg";
import chivoEstofado from "../../assets/catalog/chivo_estofado.jpeg";
import viandaAssets from "../../assets/catalog/vianda.jpeg";
import paseoLancha from "../../assets/catalog/paseo_lancha.jpeg";
import asadoPollo from "../../assets/catalog/asado_pollo.jpeg";
import postreRegional from "../../assets/catalog/postre_regional.jpeg";
import desayuno from "../../assets/catalog/desayuno.jpeg";
import merienda from "../../assets/catalog/merienda.jpeg";

// Patch local image URLs onto items that use require() assets
export const MOCK_PRODUCTS_MAP: Record<number, CatalogItem> = {
  ...CATALOG_ITEMS_MAP,
  1: { ...CATALOG_ITEMS_MAP[1], zzz_image_url: empanadas6 },
  2: { ...CATALOG_ITEMS_MAP[2], zzz_image_url: empanadas12 },
  3: { ...CATALOG_ITEMS_MAP[3], zzz_image_url: empanadas6 },
  4: { ...CATALOG_ITEMS_MAP[4], zzz_image_url: empanadas12 },
  5: { ...CATALOG_ITEMS_MAP[5], zzz_image_url: empanadas12 },
  6: { ...CATALOG_ITEMS_MAP[6], zzz_image_url: empanadas12 },
  7: { ...CATALOG_ITEMS_MAP[7], zzz_image_url: empanadasPollo },
  8: { ...CATALOG_ITEMS_MAP[8], zzz_image_url: empanadasPollo },
  10: { ...CATALOG_ITEMS_MAP[10], zzz_image_url: pastelCalabaza },
  11: { ...CATALOG_ITEMS_MAP[11], zzz_image_url: chivoEstofado },
  12: { ...CATALOG_ITEMS_MAP[12], zzz_image_url: chivoGuiso },
  9: { ...CATALOG_ITEMS_MAP[9], zzz_image_url: asadoPollo },
  13: { ...CATALOG_ITEMS_MAP[13], zzz_image_url: repollo },
  14: { ...CATALOG_ITEMS_MAP[14], zzz_image_url: postreRegional },
  15: { ...CATALOG_ITEMS_MAP[15], zzz_image_url: desayuno },
  16: { ...CATALOG_ITEMS_MAP[16], zzz_image_url: merienda },
  17: { ...CATALOG_ITEMS_MAP[17], zzz_image_url: viandaAssets },
  18: { ...CATALOG_ITEMS_MAP[18], zzz_image_url: paseoLancha },
};

// Expose categories from shared (no RN-specific data)
export { MOCK_PRODUCT_CATEGORIES, CATALOG_ITEMS_MAP, PRODUCT_CATEGORY_IDS };

// Derive array for iteration (with patched images)
export type ProductItem = CatalogItem;

export const MOCK_PRODUCTS: ProductItem[] = Object.values(MOCK_PRODUCTS_MAP);

// Named exports for direct item access
export {
  EMPANADAS_CARNE_MEDIA_DOCENA,
  EMPANADAS_CARNE_DOCENA,
  EMPANADAS_CHARQUI_MEDIA_DOCENA,
  EMPANADAS_CHARQUI_DOCENA,
  EMPANADAS_VERDURA_MEDIA_DOCENA,
  EMPANADAS_VERDURA_DOCENA,
  EMPANADAS_POLLO_MEDIA_DOCENA,
  EMPANADAS_POLLO_DOCENA,
  ASADO_POLLO,
  PASTEL_ZAPALLO_CHIVO,
  ESTOFADO_CHIVO,
  GUISO_CHIVO,
  REPOLLO_ASADO,
  POSTRE_REGIONAL,
  DESAYUNO,
  MERIENDA,
  VIANDA,
  PASEO_LANCHA,
} from "@repo/shared";
