import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ProjectFormScreen from "../[id]";

// Mocks
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "1" }),
}));

jest.mock("../../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

const mockProject = {
  id: "1",
  zzz_name: "Test Project",
  zzz_is_active: true,
  zzz_default_language: "es",
  zzz_supported_languages: ["es"],
  zzz_cascade_timeout_minutes: 30,
  zzz_max_cascade_attempts: 10,
};

const mockUpdateProject = jest.fn();

jest.mock("../../../../stores/project.store", () => ({
  useProjectStore: () => ({
    projects: [mockProject],
    selectedProject: mockProject,
    selectProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: mockUpdateProject,
    isLoading: false,
    isSaving: false,
  }),
}));

// Mock MaterialCommunityIcons to avoid native issues in tests
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => "MaterialCommunityIcons");

describe("ProjectFormScreen - Guardrail Pattern", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show deactivation warning when project is active", () => {
    render(<ProjectFormScreen />);

    // The warning box should be visible when zzz_is_active is true
    expect(screen.getByText("project.deactivate_warning")).toBeTruthy();
  });

  it("should show confirmation alert when toggling active state from true to false", () => {
    render(<ProjectFormScreen />);

    // Find the switch by testID
    const switchComp = screen.getByTestId("project-active-switch");

    // Toggle to false
    fireEvent.press(switchComp);

    // Should show AppAlert title
    expect(screen.getByText("project.deactivate_confirm_title")).toBeTruthy();
    expect(screen.getByText("project.deactivate_confirm_message")).toBeTruthy();
  });

  it("should update form state only after confirming alert", () => {
    render(<ProjectFormScreen />);

    const switchComp = screen.getByTestId("project-active-switch");

    // Toggle to false
    fireEvent.press(switchComp);

    // Press confirm button in AppAlert
    const confirmButton = screen.getByText("common.confirm");
    fireEvent.press(confirmButton);

    // Warning should change to activation help
    expect(screen.getByText("project.is_active_help")).toBeTruthy();
    expect(screen.queryByText("project.deactivate_warning")).toBeNull();
  });

  it("should NOT update form state if deactivation is cancelled", () => {
    render(<ProjectFormScreen />);

    const switchComp = screen.getByTestId("project-active-switch");

    // Toggle to false
    fireEvent.press(switchComp);

    // Press cancel button in AppAlert
    const cancelButton = screen.getByText("common.cancel");
    fireEvent.press(cancelButton);

    // Warning should still be visible (state didn't change)
    expect(screen.getByText("project.deactivate_warning")).toBeTruthy();
  });
});
