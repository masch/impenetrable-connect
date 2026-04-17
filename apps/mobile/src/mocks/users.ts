import { User, UserRole } from "@repo/shared";
import { MOCK_USER_TOURIST_WITHOUT_ORDERS, MOCK_USERS } from "./users.data";
import { mockGetCurrentUser } from "../services/auth-state";

/**
 * Mock Users for development/testing
 * Refactored to use centralized data from users.data.ts
 */

// Re-export centralized data
export { MOCK_USERS };

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
  const user = mockGetCurrentUser();
  return user?.id ?? MOCK_USER_TOURIST_WITHOUT_ORDERS.id;
}

/**
 * Check if a user is currently logged in (mock)
 */
export function isMockUserLoggedIn(): boolean {
  return mockGetCurrentUser() !== null;
}

/**
 * Get the default mock user ID (for pre-login scenarios)
 */
export function getDefaultMockUserId(): string {
  return MOCK_USER_TOURIST_WITHOUT_ORDERS.id;
}
