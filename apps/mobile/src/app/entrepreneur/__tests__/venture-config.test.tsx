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

  it("should load and display venture capacity", async () => {
    render(<VentureConfigScreen />);

    await waitFor(() => {
      expect(screen.getByText("Parador Don Esteban")).toBeTruthy();
    });

    // Maria's venture has capacity 20 in mocks
    // We need to wait for VentureCapacitySection to finish its own internal loading
    await waitFor(
      () => {
        expect(screen.getByText("20")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  it("should allow updating capacity", async () => {
    const updateSpy = jest.spyOn(MockVentureService, "updateVenture");

    render(<VentureConfigScreen />);

    await waitFor(
      () => {
        expect(screen.getByTestId("plus-button")).toBeTruthy();
      },
      { timeout: 5000 },
    );

    const plusButton = screen.getByTestId("plus-button");
    fireEvent.press(plusButton); // 20 -> 21

    const saveButton = screen.getByText("common.save");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(1, { zzz_max_capacity: 21 });
    });
  });
});
