import { useAuthStore } from "../../stores/auth.store";
import { UserRole, User } from "@repo/shared";

/**
 * Helper to mock the Auth Store state for tests.
 * This abstracts away the internal selector logic of Zustand.
 */
export const mockAuthState = (overrides: {
  currentUser: Partial<User> | null;
  userRole?: UserRole;
  isAuthenticated?: boolean;
  setUserRole?: jest.Mock;
  login?: jest.Mock;
  logout?: jest.Mock;
}) => {
  const mockedUseAuthStore = jest.mocked(useAuthStore);

  // Create a base user that satisfies all mandatory fields
  const baseUser: User | null = overrides.currentUser
    ? ({
        id: "test-user-id",
        alias: null,
        email: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        role: "TOURIST",
        zzz_failed_login_attempts: 0,
        zzz_last_login_at: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides.currentUser,
      } as User)
    : null;

  const defaultState = {
    userRole: overrides.userRole ?? baseUser?.role ?? "TOURIST",
    isAuthenticated: overrides.isAuthenticated ?? !!baseUser,
    currentUser: baseUser,
    setUserRole: overrides.setUserRole ?? jest.fn(),
    login: overrides.login ?? jest.fn(),
    logout: overrides.logout ?? jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
  };

  mockedUseAuthStore.mockImplementation((selector: unknown) => {
    return typeof selector === "function" ? selector(defaultState) : defaultState;
  });

  return defaultState;
};
