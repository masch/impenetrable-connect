import { z } from "zod";
import type { ZodIssue, ZodSchema } from "zod";
import {
  User,
  LoginInput,
  LoginInputSchema,
  AuthResponse,
  CreateUserInput,
  CreateUserInputSchema,
} from "@repo/shared";
import env from "../config/env";
import { findUserByAlias, findUserByEmail } from "../mocks/users";
import { getAuthState } from "./auth-state";

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
  login(input: LoginInput): Promise<AuthResponse>;
  createTourist(input: CreateUserInput): Promise<AuthResponse>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}

const MockAuthService: AuthServiceInterface = {
  login: async (input: LoginInput) => {
    await new Promise((r) => setTimeout(r, 500));
    // Validate input using Zod
    const validated = validateData(input, LoginInputSchema);
    const state = getAuthState();

    let existingUser: User | undefined;

    if ("email" in validated) {
      existingUser = findUserByEmail(validated.email);
    } else {
      existingUser = findUserByAlias(validated.alias);
    }

    if (!existingUser) {
      throw new Error("Invalid credentials (Mock)");
    }

    state.currentUser = {
      ...existingUser,
      zzz_last_login_at: new Date(),
    };

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: state.currentUser,
    };
  },

  createTourist: async (input: CreateUserInput) => {
    await new Promise((r) => setTimeout(r, 500));
    const validated = validateData(input, CreateUserInputSchema);
    const state = getAuthState();

    const newUser: User = {
      id: `user_${state.nextId++}`,
      ...validated,
      role: "TOURIST",
      zzz_failed_login_attempts: 0,
      zzz_last_login_at: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    state.users.push(newUser);
    state.currentUser = newUser;

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: newUser,
    };
  },

  getCurrentUser: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return getAuthState().currentUser;
  },

  logout: async () => {
    await new Promise((r) => setTimeout(r, 200));
    getAuthState().currentUser = null;
  },
};

const RestAuthService: AuthServiceInterface = {
  login: async (input: LoginInput) => {
    try {
      const response = await fetch(`${env.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "errors.auth.invalid_credentials");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Network request failed") {
        throw new Error("errors.auth.connection_failed");
      }
      throw error;
    }
  },

  createTourist: async (input: CreateUserInput) => {
    const response = await fetch(`${env.API_URL}/auth/tourist/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }
    return response.json();
  },

  getCurrentUser: async () => {
    // In a real app, this would check tokens and maybe call /auth/me
    return getAuthState().currentUser;
  },

  logout: async () => {
    // In a real app, this would invalidate the session on the server
    getAuthState().currentUser = null;
  },
};

export const authService: AuthServiceInterface = env.USE_MOCKS ? MockAuthService : RestAuthService;
