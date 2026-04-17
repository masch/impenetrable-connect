import { User } from "@repo/shared";

export const MOCK_USER_TOURIST_WITH_ORDERS: User = {
  id: "tourist_001",
  alias: "Familia Gómez",
  email: null,
  first_name: "Juan",
  last_name: "Gómez",
  whatsapp: "+5493624123456",
  user_type: "TOURIST",
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: new Date("2026-04-10T10:30:00Z"),
  is_active: true,
  created_at: new Date("2024-01-01T00:00:00Z"),
};

export const MOCK_USER_TOURIST_WITHOUT_ORDERS: User = {
  id: "tourist_002",
  alias: "Adventure Seekers",
  email: null,
  first_name: "Maria",
  last_name: "López",
  whatsapp: "+5493624987654",
  user_type: "TOURIST",
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: new Date("2026-04-09T15:45:00Z"),
  is_active: true,
  created_at: new Date("2024-01-05T00:00:00Z"),
};

export const MOCK_USER_ENTREPRENEUR_WITH_ORDERS: User = {
  id: "entrepreneur_001",
  alias: null,
  email: "maria@forst-stew.com",
  first_name: "Maria",
  last_name: "González",
  whatsapp: "+5493624111111",
  user_type: "ENTREPRENEUR",
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: new Date("2026-04-11T08:00:00Z"),
  is_active: true,
  created_at: new Date("2023-06-15T00:00:00Z"),
};

export const MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS: User = {
  id: "entrepreneur_002",
  alias: null,
  email: "pepe@regional-grill.com",
  first_name: "José",
  last_name: "Martínez",
  whatsapp: "+5493624222222",
  user_type: "ENTREPRENEUR",
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: new Date("2026-04-10T14:30:00Z"),
  is_active: true,
  created_at: new Date("2023-08-20T00:00:00Z"),
};

export const MOCK_USER_ADMIN: User = {
  id: "admin_001",
  alias: null,
  email: "admin@impenetrable.com",
  first_name: "Admin",
  last_name: "Principal",
  whatsapp: "+5493624000001",
  user_type: "ADMIN",
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: new Date("2026-04-11T07:00:00Z"),
  is_active: true,
  created_at: new Date("2023-01-01T00:00:00Z"),
};

/**
 * Pure mock data for users to avoid circular dependencies
 */
export const MOCK_USERS: User[] = [
  // === TOURISTS (3) ===
  MOCK_USER_TOURIST_WITH_ORDERS,
  MOCK_USER_TOURIST_WITHOUT_ORDERS,
  {
    id: "tourist_003",
    alias: "Viaje Familiar",
    email: null,
    first_name: "Carlos",
    last_name: "Rodríguez",
    whatsapp: "+5493624556789",
    user_type: "TOURIST",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-08T09:00:00Z"),
    is_active: true,
    created_at: new Date("2024-02-10T00:00:00Z"),
  },

  // === ENTREPRENEURS (4) ===
  MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
  MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS,
  {
    id: "entrepreneur_003",
    alias: null,
    email: "lucia@river-tours.com",
    first_name: "Lucía",
    last_name: "Fernández",
    whatsapp: "+5493624333333",
    user_type: "ENTREPRENEUR",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-11T09:15:00Z"),
    is_active: true,
    created_at: new Date("2023-09-05T00:00:00Z"),
  },
  {
    id: "entrepreneur_004",
    alias: null,
    email: "carlos@chaqueño-outdoor.com",
    first_name: "Carlos",
    last_name: "Sosa",
    whatsapp: "+5493624444444",
    user_type: "ENTREPRENEUR",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-09T16:00:00Z"),
    is_active: true,
    created_at: new Date("2023-10-12T00:00:00Z"),
  },

  // === ADMINS (2) ===
  MOCK_USER_ADMIN,
  {
    id: "admin_002",
    alias: null,
    email: "soporte@impenetrable.com",
    first_name: "Soporte",
    last_name: "Técnico",
    whatsapp: "+5493624000002",
    user_type: "ADMIN",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-10T18:30:00Z"),
    is_active: true,
    created_at: new Date("2023-03-15T00:00:00Z"),
  },
];
