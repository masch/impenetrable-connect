import { VentureMember } from "@repo/shared";
import {
  MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
  MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS,
  MOCK_USER_ENTREPRENEUR_LUCIA,
  MOCK_USER_ENTREPRENEUR_CARLOS,
} from "./users.data";
import {
  MOCK_VENTURE_WITH_ORDERS,
  MOCK_VENTURE_JOSE,
  MOCK_VENTURE_CAMPO_ALEGRE,
  MOCK_VENTURE_PLAZOLETA_NANCY,
} from "./ventures.data";

/**
 * Mock assignments of entrepreneurs to ventures
 * Matches DER table 'venture_members'
 */
export const MOCK_VENTURE_MEMBERS: VentureMember[] = [
  {
    id: 1,
    user_id: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.id, // Maria González
    venture_id: MOCK_VENTURE_WITH_ORDERS.id, // Parador Don Esteban
    role: "MANAGER",
  },
  {
    id: 2,
    user_id: MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS.id, // José Martínez
    venture_id: MOCK_VENTURE_JOSE.id, // Parador Bermejito
    role: "MANAGER",
  },
  {
    id: 3,
    user_id: MOCK_USER_ENTREPRENEUR_LUCIA.id, // Lucía Fernández
    venture_id: MOCK_VENTURE_CAMPO_ALEGRE.id, // Parador Campo Alegre
    role: "MANAGER",
  },
  {
    id: 4,
    user_id: MOCK_USER_ENTREPRENEUR_CARLOS.id, // Carlos Sosa
    venture_id: MOCK_VENTURE_PLAZOLETA_NANCY.id, // Plazoleta Nancy
    role: "MANAGER",
  },
];
