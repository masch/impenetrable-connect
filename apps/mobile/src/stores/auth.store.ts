import { create } from "zustand";
import { UserRole } from "@repo/shared";

interface AuthState {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

// Mock user for early development - will be replaced with real auth
export const useAuthStore = create<AuthState>((set) => ({
  userRole: "TOURIST",

  setUserRole: (role: UserRole) => {
    set({ userRole: role });
  },
}));
