/**
 * Centralized mapping of image keys to local asset requires.
 *
 * Shared data (packages/shared/src/mocks/product-data.ts) stores zzz_image_url
 * as a simple key string (e.g. "empanadas6") for items that have a matching
 * local image. Both MockProductService and RestProductService resolve these
 * keys to the actual require() asset at runtime.
 *
 * Keys that don't exist in this map are treated as external URLs and returned
 * as-is — the ServiceCard then renders them with { uri: url }.
 */

// Local catalog images
import empanadas6 from "../../assets/catalog/empanadas6.jpeg";
import empanadas12 from "../../assets/catalog/empanadas12.jpeg";
import empanadasPollo from "../../assets/catalog/empanadas_pollo.jpeg";
import repollo from "../../assets/catalog/repollo.jpeg";
import pastelCalabaza from "../../assets/catalog/pastel_calabaza.jpeg";
import chivoGuiso from "../../assets/catalog/chivo_guiso.jpeg";
import chivoEstofado from "../../assets/catalog/chivo_estofado.jpeg";
import vianda from "../../assets/catalog/vianda.jpeg";
import paseoLancha from "../../assets/catalog/paseo_lancha.jpeg";
import asadoPollo from "../../assets/catalog/asado_pollo.jpeg";
import postreRegional from "../../assets/catalog/postre_regional.jpeg";
import desayunoAssets from "../../assets/catalog/desayuno.jpeg";
import meriendaAssets from "../../assets/catalog/merienda.jpeg";

const IMAGE_ASSETS: Record<string, number> = {
  empanadas6,
  empanadas12,
  empanadas_pollo: empanadasPollo,
  repollo,
  pastel_calabaza: pastelCalabaza,
  chivo_guiso: chivoGuiso,
  chivo_estofado: chivoEstofado,
  vianda,
  paseo_lancha: paseoLancha,
  asado_pollo: asadoPollo,
  postre_regional: postreRegional,
  desayuno: desayunoAssets,
  merienda: meriendaAssets,
};

/**
 * Resolves an image key to a local asset if available.
 * If the key is not in the asset map, returns it unchanged (treat as external URL).
 * Returns undefined for null/undefined input.
 */
export function resolveImageUrl(
  key: string | number | null | undefined,
): string | number | undefined {
  if (!key) return undefined;
  if (typeof key !== "string") return key;
  const asset = IMAGE_ASSETS[key];
  return asset ?? key;
}

export default IMAGE_ASSETS;
