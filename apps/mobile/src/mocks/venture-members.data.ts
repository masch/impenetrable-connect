import {
  VentureMember,
  MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
  MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS,
  MOCK_USER_ENTREPRENEUR_LUCIA,
  MOCK_USER_ENTREPRENEUR_CARLOS,
  MOCK_USER_ENTREPRENEUR_PEDRO,
  MOCK_VENTURE_WITH_ORDERS,
  MOCK_VENTURE_JOSE,
  MOCK_VENTURE_CAMPO_ALEGRE,
  MOCK_VENTURE_PLAZOLETA_NANCY,
} from "@repo/shared";

/**
 * Mock assignments of entrepreneurs to ventures
 * Matches DER table 'venture_members'
 */
export const MOCK_VENTURE_MEMBERS: VentureMember[] = [
  {
    id: 1,
    userId: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.id, // Maria González
    ventureId: MOCK_VENTURE_WITH_ORDERS.id, // Parador Don Esteban
    role: "MANAGER",
  },
  {
    id: 2,
    userId: MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS.id, // José Martínez
    ventureId: MOCK_VENTURE_JOSE.id, // Parador Bermejito
    role: "MANAGER",
  },
  {
    id: 3,
    userId: MOCK_USER_ENTREPRENEUR_LUCIA.id, // Lucía Fernández
    ventureId: MOCK_VENTURE_CAMPO_ALEGRE.id, // Parador Campo Alegre
    role: "MANAGER",
  },
  {
    id: 4,
    userId: MOCK_USER_ENTREPRENEUR_CARLOS.id, // Carlos Sosa
    ventureId: MOCK_VENTURE_PLAZOLETA_NANCY.id, // Plazoleta Nancy
    role: "MANAGER",
  },
  {
    id: 5,
    userId: MOCK_USER_ENTREPRENEUR_PEDRO.id, // Pedro
    ventureId: MOCK_VENTURE_WITH_ORDERS.id, // Parador Don Esteban
    role: "MANAGER",
  },
];
