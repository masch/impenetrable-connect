import { render, screen, fireEvent, waitFor } from "./utils/test-utils";
import RoleSelectorScreen from "../app/index";
import EntrepreneurTabsLayout from "../app/entrepreneur/_layout";
import { mockAuthState } from "./utils/auth-utils";
import { router } from "expo-router";

// Mocking useAuthStore
jest.mock("../stores/auth.store");

describe("Entrepreneur Role Flow", () => {
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
        userRole: "ENTREPRENEUR",
      });
    });

    it("navigates to the agenda when an entrepreneur demo user is selected", async () => {
      render(<RoleSelectorScreen />);
      const mariaButton = screen.getByText("maria");
      fireEvent.press(mariaButton);

      await waitFor(() => {
        expect(mockSetUserRole).toHaveBeenCalledWith("ENTREPRENEUR");
        expect(mockLogin).toHaveBeenCalledWith({
          email: "maria@forst-stew.com",
          password: "password123",
        });
        expect(router.replace).toHaveBeenCalledWith("/entrepreneur/agenda");
      });
    });
  });

  describe("Entrepreneur Navigation Tabs", () => {
    beforeEach(() => {
      mockAuthState({
        userRole: "ENTREPRENEUR",
        isAuthenticated: true,
        currentUser: { id: "entrepreneur_001", role: "ENTREPRENEUR" },
      });
    });

    it("renders exactly 4 required entrepreneur tabs", () => {
      render(<EntrepreneurTabsLayout />);

      const tabs = screen.getAllByTestId("nav-tab");
      expect(tabs.length).toBe(4);

      expect(screen.getAllByText("tabs.agenda").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.request").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.roles").length).toBeGreaterThan(0);
      expect(screen.getAllByText("tabs.profile").length).toBeGreaterThan(0);
    });
  });
});
