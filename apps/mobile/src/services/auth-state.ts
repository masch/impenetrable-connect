import type { User, UserRole } from "@repo/shared";

/**
 * Shared auth state - avoid require cycles
 * Data is duplicated here (from mocks/users.ts) to break the cycle
 */

interface AuthState {
  users: User[];
  currentUser: User | null;
  nextId: number;
}

// Default users - defined here to avoid require cycle with mocks/users.ts
const DEFAULT_USERS: User[] = [
  {
    id: "tourist_001",
    alias: "Familia Gómez",
    email: null,
    first_name: "Juan",
    last_name: "Gómez",
    whatsapp: "+5493624123456",
    user_type: "TOURIST" as UserRole,
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
    user_type: "TOURIST" as UserRole,
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
    user_type: "TOURIST" as UserRole,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-08T09:00:00Z"),
    is_active: true,
    created_at: new Date("2024-02-10T00:00:00Z"),
  },
  {
    id: "entrepreneur_001",
    alias: null,
    email: "maria@forst-stew.com",
    first_name: "Maria",
    last_name: "González",
    whatsapp: "+5493624111111",
    user_type: "ENTREPRENEUR" as UserRole,
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
    user_type: "ENTREPRENEUR" as UserRole,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2026-04-10T14:30:00Z"),
    is_active: true,
    created_at: new Date("2023-08-20T00:00:00Z"),
  },
];

// Module-level state - always initialized
const authState: AuthState = {
  users: [...DEFAULT_USERS],
  currentUser: null,
  nextId: 5,
};

/**
 * Get the auth state for reading/writing
 */
export function getAuthState(): AuthState {
  return authState;
}

/**
 * Get the currently logged-in mock user
 */
export function mockGetCurrentUser(): User | null {
  return authState.currentUser;
}

/**
 * Clear the current mock user (logout)
 */
export function mockLogout(): void {
  authState.currentUser = null;
}

/**
 * Set the current mock user (login)
 */
export function mockSetCurrentUser(user: User): void {
  authState.currentUser = user;
}
