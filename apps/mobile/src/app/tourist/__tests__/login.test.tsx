import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import LoginScreen from "../login";
import { useAuthStore } from "../../../stores/auth.store";
import { UserRole } from "@repo/shared";

// Mock i18n
jest.mock("../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string, _params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "login.alias_required": "Alias is required",
        "login.alias_label": "Alias",
        "login.alias_placeholder": "Your alias",
        "login.whatsapp_label": "WhatsApp",
        "login.whatsapp_placeholder": "+54...",
        "login.first_name_label": "First name",
        "login.last_name_label": "Last name",
        "login.optional_section": "OPTIONAL",
        "login.welcome_title": "Welcome",
        "login.welcome_subtitle": "Sign up",
        "login.submit_button": "Start",
        "accessibility.login_submit_hint": "Submit form",
        "login.errors.registration_failed":
          "Registration failed. Please check your connection and try again.",
      };
      return translations[key] || key;
    },
  }),
}));

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userRole: UserRole.TOURIST,
    });
  });

  it("should show error message when registration fails (currently broken)", async () => {
    const registerSpy = jest
      .spyOn(useAuthStore.getState(), "register")
      .mockRejectedValue(new Error("errors.auth.connection_failed"));

    render(<LoginScreen />);

    // Find alias input by placeholder
    const aliasInput = screen.getByPlaceholderText("Your alias");
    fireEvent.changeText(aliasInput, "New Explorer");

    // Submit the form
    const submitButton = screen.getByText("Start");
    fireEvent.press(submitButton);

    // Wait for register to be called
    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalled();
    });

    // After the fix, the login screen should display the translated error message
    const errorMessage = screen.queryByText(
      "Registration failed. Please check your connection and try again.",
    );
    expect(errorMessage).not.toBeNull();

    registerSpy.mockRestore();
  });

  it("should not redirect when registration fails", async () => {
    jest
      .spyOn(useAuthStore.getState(), "register")
      .mockRejectedValue(new Error("errors.auth.connection_failed"));

    render(<LoginScreen />);

    const aliasInput = screen.getByPlaceholderText("Your alias");
    fireEvent.changeText(aliasInput, "New Explorer");

    const submitButton = screen.getByText("Start");
    fireEvent.press(submitButton);

    // Wait for the async operation to settle
    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("should redirect to /tourist on successful registration", async () => {
    jest.spyOn(useAuthStore.getState(), "register").mockResolvedValue(undefined);

    render(<LoginScreen />);

    const aliasInput = screen.getByPlaceholderText("Your alias");
    fireEvent.changeText(aliasInput, "New Explorer");

    const submitButton = screen.getByText("Start");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/tourist");
    });
  });
});
