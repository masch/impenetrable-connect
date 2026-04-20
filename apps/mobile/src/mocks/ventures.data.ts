import { Venture } from "@repo/shared";
import { SERVICE_CATEGORY_IDS } from "./catalog";

export const MOCK_VENTURE_WITH_ORDERS: Venture = {
  id: 1,
  catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  name: "Parador Don Esteban",
  description: "Comida casera con amor",
  address: "Calle Falsa 123, Bermejito",
  latitude: -25.0,
  longitude: -60.0,
  max_capacity: 20,
  is_paused: false,
  is_active: true,
  role_type_id: 1,
  cascade_order: 0,
};

export const MOCK_VENTURE_JOSE: Venture = {
  id: 2,
  catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  name: "Parador Bermejito",
  description: "Los mejores asados del Chaco",
  address: "Ruta 95, Km 20",
  latitude: -25.1,
  longitude: -60.1,
  max_capacity: 50,
  is_paused: false,
  is_active: true,
  role_type_id: 1,
  cascade_order: 1,
};

export const MOCK_VENTURE_CAMPO_ALEGRE: Venture = {
  id: 3,
  catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  name: "Parador Campo Alegre",
  description: "Comida casera con amor",
  address: "Calle Falsa 123, Bermejito",
  latitude: -25.0,
  longitude: -60.0,
  max_capacity: 20,
  is_paused: false,
  is_active: true,
  role_type_id: 1,
  cascade_order: 0,
};

export const MOCK_VENTURE_PLAZOLETA_NANCY: Venture = {
  id: 4,
  catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
  name: "Plazoleta Nancy",
  description: "Comida casera con amor",
  address: "Calle Falsa 123, Bermejito",
  latitude: -25.0,
  longitude: -60.0,
  max_capacity: 20,
  is_paused: false,
  is_active: true,
  role_type_id: 1,
  cascade_order: 0,
};

export const MOCK_VENTURES: Venture[] = [
  MOCK_VENTURE_WITH_ORDERS,
  MOCK_VENTURE_JOSE,
  MOCK_VENTURE_CAMPO_ALEGRE,
  MOCK_VENTURE_PLAZOLETA_NANCY,
];
