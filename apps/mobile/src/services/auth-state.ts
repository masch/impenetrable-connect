import type { User } from "@repo/shared";
import { MOCK_USERS } from "../mocks/users.data";

/**
 * Shared auth state for mock usage.
 * Centralizes MOCK_USERS as the Single Source of Truth.
 */

interface AuthState {
  users: User[];
  currentUser: User | null;
  nextId: number;
}

// Module-level state - always initialized with the first entrepreneur (Maria)
const authState: AuthState = {
  users: [...MOCK_USERS],
  currentUser: MOCK_USERS.find((u) => u.id === "entrepreneur_001") || null,
  nextId: MOCK_USERS.length + 1,
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
