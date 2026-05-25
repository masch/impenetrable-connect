import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import OrderSetupScreen from "../index";
import { useProjectStore } from "../../../stores/project.store";
import { Project, ServiceMoment, createHourMinute } from "@repo/shared";
import { useCartStore } from "../../../stores/cart.store";

// Mock hooks and stores
jest.mock("../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Stack: {
    Screen: jest.fn(() => null),
  },
}));

describe("OrderSetupScreen", () => {
  beforeEach(() => {
    useCartStore.setState({ guestCount: 1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should not limit guest count based on project (removed system cap)", () => {
    useProjectStore.setState({
      selectedProject: {
        zzz_id: 1,
        zzz_name: "Test",
        zzz_is_active: true,
      } as unknown as Project,
    });

    render(<OrderSetupScreen />);

    const plusButton = screen.getByTestId("guest-plus-button");

    // Press 6 times
    for (let i = 0; i < 6; i++) {
      fireEvent.press(plusButton);
    }

    // Should be 7 (initial 1 + 6 presses)
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("should attempt to fetch projects if none is selected on mount", async () => {
    const fetchProjectsSpy = jest.spyOn(useProjectStore.getState(), "fetchProjects");

    useProjectStore.setState({
      selectedProject: null,
      error: null,
      isLoading: false,
    });

    render(<OrderSetupScreen />);

    expect(fetchProjectsSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("common.loading")).toBeTruthy();
    });
  });

  it("should show error when fetch fails or no project is found after loading", async () => {
    useProjectStore.setState({
      selectedProject: null,
      error: "Project fetch failed",
      isLoading: false,
    });

    render(<OrderSetupScreen />);

    await waitFor(() => {
      expect(screen.getByText("common.error")).toBeTruthy();
      expect(screen.getByText("Project fetch failed")).toBeTruthy();
    });
  });

  it("should auto-select the first project if projects are loaded but none is selected", async () => {
    const selectProjectSpy = jest.spyOn(useProjectStore.getState(), "selectProject");
    const mockProject = { zzz_id: 1, zzz_name: "Project A", zzz_is_active: true } as Project;

    // Simulate projects loaded but none selected
    useProjectStore.setState({
      projects: [mockProject],
      selectedProject: null,
      isLoading: false,
      error: null,
    });

    render(<OrderSetupScreen />);

    await waitFor(() => {
      expect(selectProjectSpy).toHaveBeenCalledWith(mockProject.zzz_id);
    });
  });

  it("should set context and navigate to booking when form is valid and submitted", async () => {
    useCartStore.setState({
      selectedDate: new Date("2024-01-15T00:00:00-03:00"),
      selectedMoment: "LUNCH" as ServiceMoment,
      selectedTime: createHourMinute("13:00"),
      guestCount: 2,
    });

    useProjectStore.setState({
      selectedProject: { zzz_id: 1, zzz_name: "Test" } as Project,
      isLoading: false,
    });

    render(<OrderSetupScreen />);

    const submitButton = screen.getByLabelText("order_setup.submit");

    // Verify the button is not disabled
    expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();

    fireEvent.press(submitButton);

    await waitFor(() => {
      const state = useCartStore.getState();
      expect(state.selectedDate).toEqual(expect.any(Date));
      expect(state.selectedMoment).toBe("LUNCH");
      expect(mockPush).toHaveBeenCalledWith("/tourist/booking");
    });
  });
});
