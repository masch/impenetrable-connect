import { z } from "zod";
import type { ZodIssue, ZodSchema } from "zod";
import { User, CreateUserSchema, CreateUserInput } from "@repo/shared";
import env from "../config/env";
import { MOCK_USERS, findUserByAlias } from "../mocks/users";

/**
 * Validate data using Zod schemas
 */
function validateData<S extends ZodSchema>(data: unknown, schema: S): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((i: ZodIssue) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

interface AuthServiceInterface {
  login(userData: CreateUserInput): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}

const mockUsers = [...MOCK_USERS];
let currentUser: User | null = null;
let nextId = 3;

const MockAuthService: AuthServiceInterface = {
  login: async (userData: CreateUserInput) => {
    await new Promise((r) => setTimeout(r, 500));
    // Validate input using Zod
    const validated = validateData(userData, CreateUserSchema);
    // Check if user exists in mock data
    const alias = validated.alias ?? "";
    const existingUser = findUserByAlias(alias);
    if (existingUser) {
      currentUser = {
        ...existingUser,
        last_login_at: new Date(),
      };
      return currentUser;
    }
    // Create new user
    const newUser: User = {
      id: `user_${nextId++}`,
      alias: validated.alias,
      email: validated.email,
      first_name: validated.first_name,
      last_name: validated.last_name,
      whatsapp: validated.whatsapp,
      user_type: validated.user_type ?? "TOURIST",
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date(),
      is_active: true,
      created_at: new Date(),
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    return currentUser;
  },

  getCurrentUser: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return currentUser;
  },

  logout: async () => {
    await new Promise((r) => setTimeout(r, 200));
    currentUser = null;
  },
};

const RestAuthService: AuthServiceInterface = {
  login: async (userData: CreateUserInput) => {
    const response = await fetch(`${env.API_URL}/auth/tourist/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("API error creating user");
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${env.API_URL}/auth/me`);
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("API error fetching user");
    return response.json();
  },

  logout: async () => {
    await fetch(`${env.API_URL}/auth/logout`, { method: "POST" });
  },
};

export const AuthService = env.USE_MOCKS ? MockAuthService : RestAuthService;

/**
 * Mock login - searches in mock users or creates new one
 */
export function mockLogin(userData: CreateUserInput): User {
  // Check if user exists in mock data
  const alias = userData.alias ?? "";
  const existingUser = findUserByAlias(alias);
  if (existingUser) {
    currentUser = {
      ...existingUser,
      last_login_at: new Date(),
    };
    return currentUser;
  }

  // Create new user (convert null to undefined for nullable fields)
  const newUser: User = {
    id: `user_${nextId++}`,
    alias: userData.alias ?? null,
    email: userData.email ?? null,
    first_name: userData.first_name ?? null,
    last_name: userData.last_name ?? null,
    whatsapp: userData.whatsapp ?? null,
    user_type: userData.user_type ?? "TOURIST",
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(),
    is_active: true,
    created_at: new Date(),
  };
  mockUsers.push(newUser);
  currentUser = newUser;
  return currentUser;
}

export function mockLogout(): void {
  currentUser = null;
}

export function mockGetCurrentUser(): User | null {
  return currentUser;
}
