import { User } from "@repo/shared";

/**
 * Mock Users - matches DER User entity
 * Tourists use alias, Entrepreneurs/Admins use email
 */
export const MOCK_USERS: User[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    alias: "Familia Gómez",
    email: null,
    first_name: "Juan",
    last_name: "Gómez",
    whatsapp: "+5493624123456",
    user_type: "TOURIST",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2024-01-15T10:30:00Z"),
    is_active: true,
    created_at: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    alias: "Adventure Seekers",
    email: null,
    first_name: "Maria",
    last_name: "López",
    whatsapp: "+5493624987654",
    user_type: "TOURIST",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date("2024-01-14T15:45:00Z"),
    is_active: true,
    created_at: new Date("2024-01-05T00:00:00Z"),
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
