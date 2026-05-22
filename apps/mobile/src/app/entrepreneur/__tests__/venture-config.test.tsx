import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import VentureConfigScreen from "../venture-config";
import { MockVentureService } from "../../../services/venture.service";
import { useAuthStore } from "../../../stores/auth.store";
import { useProjectStore } from "../../../stores/project.store";
import { useVentureStore } from "../../../stores/venture.store";
import { User, Project, Venture } from "@repo/shared";

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

  it("should show empty state when user has no ventures", async () => {
    useVentureStore.setState({
      fetchVenturesByUserId: async () => {},
      userVentures: [],
      selectedVenture: null,
      isLoading: false,
    });

    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByText("venture.no_ventures")).toBeTruthy();
    });
  });

  it("should show venture selector when user has multiple ventures", async () => {
    useVentureStore.setState({
      fetchVenturesByUserId: async () => {},
      userVentures: [
        {
          id: 1,
          name: "Parador Don Esteban",
          ownerId: mariaId,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          zzz_project_id: 1,
        },
        {
          id: 2,
          name: "Parador Campo Alegre",
          ownerId: mariaId,
          zzz_max_capacity: 30,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          zzz_project_id: 1,
        },
      ] as Venture[],
      selectedVenture: null,
      isLoading: false,
    });

    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("venture-selector-1")).toBeTruthy();
      expect(screen.getByTestId("venture-selector-2")).toBeTruthy();
    });

    // No auto-select when >1 venture — user must pick one first
  });

  it("should update draft capacity when switching between ventures", async () => {
    useVentureStore.setState({
      fetchVenturesByUserId: async () => {},
      userVentures: [
        {
          id: 1,
          name: "Parador Don Esteban",
          ownerId: mariaId,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          zzz_project_id: 1,
        },
        {
          id: 2,
          name: "Parador Campo Alegre",
          ownerId: mariaId,
          zzz_max_capacity: 30,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          zzz_project_id: 1,
        },
      ] as Venture[],
      selectedVenture: {
        id: 1,
        name: "Parador Don Esteban",
        ownerId: mariaId,
        zzz_max_capacity: 20,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        zzz_project_id: 1,
      } as Venture,
      isLoading: false,
    });

    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("capacity-text").props.children).toBe(20);
    });

    // Switch to venture 2
    fireEvent.press(screen.getByTestId("venture-selector-2"));

    await waitFor(() => {
      expect(screen.getByTestId("capacity-text").props.children).toBe(30);
    });

    // Switch back to venture 1
    fireEvent.press(screen.getByTestId("venture-selector-1"));

    await waitFor(() => {
      expect(screen.getByTestId("capacity-text").props.children).toBe(20);
    });
  });
});
