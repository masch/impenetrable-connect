import { UserRole } from "@repo/shared";
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
        userRole: UserRole.ENTREPRENEUR,
      });
    });

    it("navigates to the request tab when an entrepreneur with pending requests (Maria) is selected", async () => {
      render(<RoleSelectorScreen />);
      const mariaButton = screen.getByText(/maria/i);
      fireEvent.press(mariaButton);

      await waitFor(() => {
        expect(mockSetUserRole).toHaveBeenCalledWith(UserRole.ENTREPRENEUR);
        expect(mockLogin).toHaveBeenCalledWith({
          email: "maria@forst-stew.com",
          password: "password123",
        });
        expect(router.replace).toHaveBeenCalledWith("/entrepreneur/request");
      });
    });

    it("navigates to the agenda tab when an entrepreneur without pending requests (José) is selected", async () => {
      render(<RoleSelectorScreen />);
      const joseButton = screen.getByText(/josé/i);
      fireEvent.press(joseButton);

      await waitFor(() => {
        expect(mockSetUserRole).toHaveBeenCalledWith(UserRole.ENTREPRENEUR);
        expect(mockLogin).toHaveBeenCalledWith({
          email: "pepe@regional-grill.com",
          password: "password123",
        });
        expect(router.replace).toHaveBeenCalledWith("/entrepreneur/agenda");
      });
    });
  });

  describe("Entrepreneur Navigation Tabs", () => {
    beforeEach(() => {
      mockAuthState({
        userRole: UserRole.ENTREPRENEUR,
        isAuthenticated: true,
        currentUser: { id: "entrepreneur_001", role: UserRole.ENTREPRENEUR },
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
