import { render, screen, fireEvent, waitFor } from "./utils/test-utils";
import RoleSelectorScreen from "../app/index";
import { useAuthStore } from "../stores/auth.store";
import { router } from "expo-router";

// Better pattern: Using jest.mocked for type-safe mocks
jest.mock("../stores/auth.store");
const mockedUseAuthStore = jest.mocked(useAuthStore);

describe("RoleSelectorScreen UI (Archetypal Test)", () => {
  const mockSetUserRole = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockLogout = jest.fn().mockResolvedValue(undefined);

    // Implementation for hook usage
    mockedUseAuthStore.mockImplementation((selector: unknown) => {
      const state = {
        setUserRole: mockSetUserRole,
        login: mockLogin,
        logout: mockLogout,
        currentUser: null,
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    // Implementation for static getState usage
    mockedUseAuthStore.getState = jest.fn().mockReturnValue({
      logout: mockLogout,
      currentUser: null,
    });
  });

  it("renders correctly with localized role options and demo users", () => {
    render(<RoleSelectorScreen />);

    // Check main title (using our mock t function which returns the key)
    expect(screen.getByText("role_selector.welcome")).toBeTruthy();

    // Check role labels (match the enum-based keys in JSON)
    expect(screen.getByText("role_selector.roles.TOURIST.label")).toBeTruthy();
    expect(screen.getByText("role_selector.roles.ENTREPRENEUR.label")).toBeTruthy();
    expect(screen.getByText("role_selector.roles.ADMIN.label")).toBeTruthy();

    // Check that demo users are rendered
    // Tourists (shown by alias)
    expect(screen.getByText("Familia Gómez")).toBeTruthy();
    expect(screen.getByText("Adventure Seekers")).toBeTruthy();

    // Entrepreneurs (shown by firstName or email prefix)
    expect(screen.getByText("Maria")).toBeTruthy();
    expect(screen.getByText("José")).toBeTruthy();

    // Admins (shown by firstName or email prefix)
    expect(screen.getByText("admin")).toBeTruthy(); // admin@impenetrable.com
  });

  it("navigates to signup when clicking create identity", () => {
    render(<RoleSelectorScreen />);

    const signUpButton = screen.getByText("role_selector.create_identity");
    fireEvent.press(signUpButton);

    expect(mockSetUserRole).toHaveBeenCalledWith("TOURIST");
    expect(mockLogin).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/tourist/login");
  });

  it("handles demo user login correctly", async () => {
    render(<RoleSelectorScreen />);

    // Click on a demo tourist
    const demoUserButton = screen.getByText("Familia Gómez");
    fireEvent.press(demoUserButton);

    await waitFor(() => {
      expect(mockSetUserRole).toHaveBeenCalledWith("TOURIST");
      expect(mockLogin).toHaveBeenCalledWith({
        alias: "Familia Gómez",
      });
      expect(router.replace).toHaveBeenCalledWith("/tourist");
    });
  });
});
