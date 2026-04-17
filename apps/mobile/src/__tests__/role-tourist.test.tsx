import { render, screen, fireEvent } from "./utils/test-utils";
import RoleSelectorScreen from "../app/index";
import TouristTabsLayout from "../app/tourist/_layout";
import { mockAuthState } from "./utils/auth-utils";
import { router } from "expo-router";

// Mocking useAuthStore
jest.mock("../stores/auth.store");

describe("Tourist Role Flow", () => {
  const mockSetUserRole = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login via Role Selector", () => {
    beforeEach(() => {
      mockAuthState({
        currentUser: null,
        setUserRole: mockSetUserRole,
        login: mockLogin,
        isAuthenticated: false,
        userRole: "TOURIST",
      });
    });

    it("navigates to the catalog when 'Familia Gómez' is selected", () => {
      render(<RoleSelectorScreen />);
      const gomezButton = screen.getByText("Familia Gómez");
      fireEvent.press(gomezButton);

      expect(mockSetUserRole).toHaveBeenCalledWith("TOURIST");
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          user_type: "TOURIST",
          alias: "Familia Gómez",
        }),
      );
      expect(router.push).toHaveBeenCalledWith("/tourist");
    });
  });

  describe("Tourist Navigation Tabs", () => {
    beforeEach(() => {
      mockAuthState({
        userRole: "TOURIST",
        isAuthenticated: true,
        currentUser: { id: "tourist_001", user_type: "TOURIST" },
      });
    });

    it("renders exactly 5 required tourist tabs", () => {
      render(<TouristTabsLayout />);

      const tabs = screen.getAllByTestId("nav-tab");
      expect(tabs.length).toBe(5);

      expect(screen.getAllByText("tabs.catalog").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.orders").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.login").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.roles").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.profile").length).toBeGreaterThan(0);
    });
  });
});
