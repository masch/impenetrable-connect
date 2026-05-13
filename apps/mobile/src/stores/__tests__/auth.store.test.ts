import { useAuthStore } from "../auth.store";
import { authService } from "../../services/auth.service";
import { UserRole } from "@repo/shared";

jest.mock("../../services/auth.service", () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    createTourist: jest.fn(),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userRole: UserRole.TOURIST,
    });
    jest.clearAllMocks();
  });

  it("should set accessToken and currentUser on successful login", async () => {
    const mockUser = { id: "1", email: "test@test.com", role: UserRole.ENTREPRENEUR };
    const mockToken = "fake-jwt-token";

    (authService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      accessToken: mockToken,
      refreshToken: "refresh",
    });

    await useAuthStore.getState().login({ email: "test@test.com", password: "password" });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.currentUser).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBe(null);
  });

  it("should clear everything on logout", async () => {
    useAuthStore.setState({
      accessToken: "token",
      currentUser: { id: "1" } as any,
      isAuthenticated: true,
    });

    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(null);
    expect(state.currentUser).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set i18n error key on login failure", async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error("errors.auth.invalid_credentials"));

    // login() re-throws, so we must catch it
    try {
      await useAuthStore.getState().login({ email: "test@test.com", password: "wrong" });
    } catch (e) {
      // Expected
    }

    const state = useAuthStore.getState();
    expect(state.error).toBe("errors.auth.invalid_credentials");
    expect(state.isAuthenticated).toBe(false);
  });
});
