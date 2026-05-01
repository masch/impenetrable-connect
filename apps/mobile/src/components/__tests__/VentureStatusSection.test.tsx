import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import VentureStatusSection from "../VentureStatusSection";

// Mock hooks
jest.mock("../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe("VentureStatusSection", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly in active state", () => {
    render(<VentureStatusSection isPaused={false} onValueChange={mockOnValueChange} />);

    expect(screen.getByText("venture.management")).toBeTruthy();
    expect(screen.getByText("venture.is_paused")).toBeTruthy();
    expect(screen.getByText("venture.deactivate_warning")).toBeTruthy();
  });

  it("should show help legend when venture is paused", () => {
    render(<VentureStatusSection isPaused={true} onValueChange={mockOnValueChange} />);

    expect(screen.getByText("venture.is_paused_help")).toBeTruthy();
    expect(screen.queryByText("venture.deactivate_warning")).toBeNull();
  });

  it("should show confirmation alert when toggling status", () => {
    render(<VentureStatusSection isPaused={false} onValueChange={mockOnValueChange} />);

    // Switch for "Venture Active" is ON when isPaused is false
    // We toggle it (turn OFF)
    const switchComp = screen.getByTestId("venture-active-switch");
    fireEvent.press(switchComp);

    // Should show alert title for pausing (deactivating)
    expect(screen.getByText("venture.pause_confirm_title")).toBeTruthy();
    expect(screen.getByText("venture.pause_confirm_message")).toBeTruthy();

    // onValueChange should NOT have been called yet
    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it("should call onValueChange after confirming alert", () => {
    render(<VentureStatusSection isPaused={false} onValueChange={mockOnValueChange} />);

    const switchComp = screen.getByTestId("venture-active-switch");
    fireEvent.press(switchComp);

    const confirmButton = screen.getByText("common.confirm");
    fireEvent.press(confirmButton);

    // If isPaused was false, and we toggled to pause, new isPaused value should be true
    expect(mockOnValueChange).toHaveBeenCalledWith(true);
  });

  it("should not call onValueChange if alert is cancelled", () => {
    render(<VentureStatusSection isPaused={false} onValueChange={mockOnValueChange} />);

    const switchComp = screen.getByTestId("venture-active-switch");
    fireEvent.press(switchComp);

    const cancelButton = screen.getByText("common.cancel");
    fireEvent.press(cancelButton);

    expect(mockOnValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText("venture.pause_confirm_title")).toBeNull();
  });
});
