import { User, UserRole } from "@repo/shared";

/**
 * Mock Users for development/testing
 *
 * Users by role:
 * - Tourists: log in with alias
 * - Entrepreneurs/Admins: log in with email
 */

// Default mock user ID (matches first tourist)
export const DEFAULT_MOCK_USER_ID = "tourist_001";

/**
 * Default mock users - single source of truth (no duplicates)
 */
export const MOCK_USERS: User[] = [
  // === TOURISTS (3) ===
  {
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
  },
  {
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
  },
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
  {
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
  },
  {
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
  },
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
  {
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
  },
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

/**
 * Find a tourist by alias (case-insensitive)
 */
export function findUserByAlias(alias: string): User | undefined {
  return MOCK_USERS.find(
    (u) => u.user_type === "TOURIST" && u.alias?.toLowerCase() === alias.toLowerCase(),
  );
}

/**
 * Find a user by email (case-insensitive)
 */
export function findUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

/**
 * Get all mock users by role
 */
export function getUsersByRole(role: UserRole): User[] {
  return MOCK_USERS.filter((u) => u.user_type === role);
}

/**
 * Demo user for UI (with login identifier)
 */
export interface DemoUser {
  identifier: string; // alias for tourists, email for others
  description: string;
  role: UserRole;
}

// Demo users for Tourist login (light login - alias only)
export const DEMO_TOURIST_USERS: DemoUser[] = [
  { identifier: "Familia Gómez", description: "Tourist 1", role: "TOURIST" },
  { identifier: "Adventure Seekers", description: "Tourist 2", role: "TOURIST" },
  { identifier: "Viaje Familiar", description: "Tourist 3", role: "TOURIST" },
];

// Demo users for Entrepreneur login (full login - email + password)
export const DEMO_ENTREPRENEUR_USERS: DemoUser[] = [
  { identifier: "maria@forst-stew.com", description: "Forst Stew", role: "ENTREPRENEUR" },
  { identifier: "pepe@regional-grill.com", description: "Regional Grill", role: "ENTREPRENEUR" },
  { identifier: "lucia@river-tours.com", description: "River Tours", role: "ENTREPRENEUR" },
  {
    identifier: "carlos@chaqueño-outdoor.com",
    description: "Chaiqueño Outdoor",
    role: "ENTREPRENEUR",
  },
];

// Demo users for Admin login (full login - email + password)
export const DEMO_ADMIN_USERS: DemoUser[] = [
  { identifier: "admin@impenetrable.com", description: "Admin Principal", role: "ADMIN" },
  { identifier: "soporte@impenetrable.com", description: "Soporte", role: "ADMIN" },
];

/**
 * Get demo users grouped by role (for UI) - all roles
 */
export const DEMO_USERS_BY_ROLE: { role: UserRole; label: string; users: DemoUser[] }[] = [
  { role: "TOURIST", label: "Turistas", users: DEMO_TOURIST_USERS },
  { role: "ENTREPRENEUR", label: "Emprendedores", users: DEMO_ENTREPRENEUR_USERS },
  { role: "ADMIN", label: "Administradores", users: DEMO_ADMIN_USERS },
];

/**
 * Get the current mock user ID
 */
export function getMockUserId(): string {
  try {
    const { mockGetCurrentUser } = require("../services/auth-state");
    const user = mockGetCurrentUser();
    return user?.id ?? DEFAULT_MOCK_USER_ID;
  } catch {
    return DEFAULT_MOCK_USER_ID;
  }
}

/**
 * Check if a user is currently logged in (mock)
 */
export function isMockUserLoggedIn(): boolean {
  try {
    const { mockGetCurrentUser } = require("../services/auth-state");
    return mockGetCurrentUser() !== null;
  } catch {
    return false;
  }
}

/**
 * Get the default mock user ID (for pre-login scenarios)
 */
export function getDefaultMockUserId(): string {
  return DEFAULT_MOCK_USER_ID;
}
