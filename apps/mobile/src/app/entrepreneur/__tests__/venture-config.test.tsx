import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import VentureConfigScreen from "../venture-config";
import { MockVentureService } from "../../../services/venture.service";
import { useAuthStore } from "../../../stores/auth.store";
import { useProjectStore } from "../../../stores/project.store";
import { User, Project } from "@repo/shared";

// Mock hooks and services
jest.mock("../../../services/logger.service", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

describe("VentureConfigScreen", () => {
  const mariaId = "entrepreneur_001";

  beforeEach(() => {
    useAuthStore.setState({ currentUser: { id: mariaId } as unknown as User });
    useProjectStore.setState({
      selectedProject: {
        zzz_id: 1,
        zzz_max_capacity_limit: 50,
      } as unknown as Project,
    });
    jest.clearAllMocks();
  });

  it("should load and display venture configuration", async () => {
    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByText("Parador Don Esteban")).toBeTruthy();
    });

    // Capacity should be 20 from mocks (editable one)
    await waitFor(() => {
      expect(screen.getByTestId("capacity-text").props.children).toBe(20);
    });

    // Save button should be disabled initially
    expect(screen.getByTestId("save-button").props.accessibilityState.disabled).toBe(true);
  });

  it("should allow updating both capacity and pause status atomically", async () => {
    const updateSpy = jest.spyOn(MockVentureService, "updateVenture");

    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("plus-button")).toBeTruthy();
    });

    // 1. Change capacity: 20 -> 21
    const plusButton = screen.getByTestId("plus-button");
    fireEvent.press(plusButton);

    // 2. Toggle pause status: Active -> Paused
    const switchComp = screen.getByRole("switch");
    fireEvent.press(switchComp);

    // Confirm the alert
    const confirmButton = screen.getByText("common.confirm");
    fireEvent.press(confirmButton);

    // Save button should now be enabled
    expect(screen.getByTestId("save-button").props.accessibilityState.disabled).toBe(false);

    // 3. Save globally
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(1, {
        zzz_max_capacity: 21,
        zzz_is_paused: true,
      });
    });
  });

  it("should remain disabled if changes are reverted to original values", async () => {
    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("plus-button")).toBeTruthy();
    });

    const plusButton = screen.getByTestId("plus-button");
    const minusButton = screen.getByTestId("minus-button");

    fireEvent.press(plusButton); // 21
    expect(screen.getByTestId("save-button").props.accessibilityState.disabled).toBe(false);

    fireEvent.press(minusButton); // Back to 20
    expect(screen.getByTestId("save-button").props.accessibilityState.disabled).toBe(true);
  });
});
