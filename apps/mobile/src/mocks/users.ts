/**
 * Mock Users - Re-exports from centralized users.data.ts
 * Functions that depend on auth-state are defined here to avoid circular deps
 */

import { User, type UserRole, MOCK_USERS, MOCK_USER_TOURIST_WITH_ORDERS } from "@repo/shared";
import { mockGetCurrentUser } from "../services/auth-state";

export type { User, UserRole };

// Derive demo users from MOCK_USERS - same as User[] but typed for UI
export function getDemoUsersByRole(role: UserRole): User[] {
  const users = MOCK_USERS.filter((u) => u.role === role);
  return users;
}

export function findUserByAlias(alias: string): User | undefined {
  return MOCK_USERS.find((u) => u.role === "TOURIST" && u.alias === alias);
}

export function findUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getMockUserId(): string {
  const user = mockGetCurrentUser();
  return user?.id ?? MOCK_USER_TOURIST_WITH_ORDERS.id;
}

export function isMockUserLoggedIn(): boolean {
  return mockGetCurrentUser() !== null;
}

export function getDefaultMockUserId(): string {
  return MOCK_USER_TOURIST_WITH_ORDERS.id;
}
