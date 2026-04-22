import { Venture } from "../types/venture";

export const MOCK_VENTURES: Venture[] = [
  {
    id: 1,
    name: "Parador Don Esteban",
    ownerId: "entrepreneur_001",
    zzz_max_capacity: 20,
    zzz_is_paused: false,
    zzz_is_active: true,
    zzz_cascade_order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Parador Bermejito",
    ownerId: "entrepreneur_001",
    zzz_max_capacity: 50,
    zzz_is_paused: false,
    zzz_is_active: true,
    zzz_cascade_order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Parador Campo Alegre",
    ownerId: "entrepreneur_001",
    zzz_max_capacity: 20,
    zzz_is_paused: false,
    zzz_is_active: true,
    zzz_cascade_order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Plazoleta Nancy",
    ownerId: "entrepreneur_001",
    zzz_max_capacity: 20,
    zzz_is_paused: false,
    zzz_is_active: true,
    zzz_cascade_order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_VENTURE_WITH_ORDERS = MOCK_VENTURES[0];
export const MOCK_VENTURE_JOSE = MOCK_VENTURES[1];
export const MOCK_VENTURE_CAMPO_ALEGRE = MOCK_VENTURES[2];
export const MOCK_VENTURE_PLAZOLETA_NANCY = MOCK_VENTURES[3];
