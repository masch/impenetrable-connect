import { create } from "zustand";
import { User, UserRole, LoginInput, CreateUserInput } from "@repo/shared";
import { authService } from "../services/auth.service";
import { logger } from "../services/logger.service";
import { useAgendaStore } from "./agenda.store";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Role for tab routing
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Actions
  login: (input: LoginInput) => Promise<void>;
  register: (input: CreateUserInput) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userRole: UserRole.TOURIST,

  setUserRole: (role) => set({ userRole: role }),

  login: async (input: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(input);
      set({
        currentUser: response.user,
        isAuthenticated: true,
        isLoading: false,
        userRole: response.user.role,
      });
      // Note: In a production app, we would persist tokens to SecureStore here
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (input: CreateUserInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.createTourist(input);
      set({
        currentUser: response.user,
        isAuthenticated: true,
        isLoading: false,
        userRole: response.user.role,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      // Reset other stores
      useAgendaStore.getState().reset();

      set({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        userRole: UserRole.TOURIST,
      });
    } catch (error) {
      set({ isLoading: false });
      logger.error("Logout failed", error);
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  clearError: () => set({ error: null }),
}));
