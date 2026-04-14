import { create } from "zustand";
import { User, CreateUserInput, UserRole } from "@repo/shared";
import env from "../config/env";
import { mockLogin, mockLogout } from "../services/auth.service";

interface AuthState {
  // User state - using User entity from shared package (DER)
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Role for tab routing
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Actions
  login: (userData: CreateUserInput) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// Mock auth for early development - will be replaced with real auth API
export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: "TOURIST",

  setUserRole: (role) => set({ userRole: role }),

  login: (userData) => {
    if (env.USE_MOCKS) {
      const user = mockLogin(userData);
      set({ currentUser: user, isAuthenticated: true, isLoading: false, userRole: user.user_type });
    } else {
      // TODO: Call real auth API
      const user: User = {
        id: `user_${Date.now()}`,
        alias: userData.alias,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        whatsapp: userData.whatsapp,
        user_type: userData.user_type ?? "TOURIST",
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
        is_active: true,
        created_at: new Date(),
      };
      set({ currentUser: user, isAuthenticated: true, isLoading: false, userRole: user.user_type });
    }
  },

  logout: () => {
    if (env.USE_MOCKS) {
      mockLogout();
    }
    set({ currentUser: null, isAuthenticated: false, userRole: "TOURIST" });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
