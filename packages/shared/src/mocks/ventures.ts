import { Venture } from "../types/venture";
import {
  MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
  MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS,
  MOCK_USER_ENTREPRENEUR_LUCIA,
  MOCK_USER_ENTREPRENEUR_CARLOS,
} from "./users";

export const MOCK_VENTURES: Venture[] = [
  {
    id: 1,
    name: "Parador Don Esteban",
    ownerId: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.id,
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
    ownerId: MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS.id,
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
    ownerId: MOCK_USER_ENTREPRENEUR_LUCIA.id,
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
    ownerId: MOCK_USER_ENTREPRENEUR_CARLOS.id,
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
