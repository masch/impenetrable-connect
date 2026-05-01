import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FormSwitch } from "../FormSwitch";

describe("FormSwitch", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly with label", () => {
    render(<FormSwitch label="Test Label" value={false} onValueChange={mockOnValueChange} />);

    expect(screen.getByText("Test Label")).toBeTruthy();
    expect(screen.getByRole("switch")).toBeTruthy();
  });

  it("should call onValueChange when pressed", () => {
    render(<FormSwitch label="Test Label" value={false} onValueChange={mockOnValueChange} />);

    const switchComp = screen.getByRole("switch");
    fireEvent.press(switchComp);

    expect(mockOnValueChange).toHaveBeenCalledWith(true);
  });

  it("should respect the disabled prop", () => {
    render(
      <FormSwitch
        label="Test Label"
        value={false}
        onValueChange={mockOnValueChange}
        disabled={true}
      />,
    );

    const switchComp = screen.getByRole("switch");
    fireEvent.press(switchComp);

    expect(mockOnValueChange).not.toHaveBeenCalled();
    // Check accessibility state
    expect(switchComp.props.accessibilityState.disabled).toBe(true);
  });

  it("should use the provided testID", () => {
    render(
      <FormSwitch
        label="Test Label"
        value={false}
        onValueChange={mockOnValueChange}
        testID="custom-switch"
      />,
    );

    expect(screen.getByTestId("custom-switch")).toBeTruthy();
  });

  it("should render warning when value is true and warning prop is provided", () => {
    const warning = "Deactivation Warning";
    render(<FormSwitch label="Test" value={true} onValueChange={() => {}} warning={warning} />);
    expect(screen.getByText(warning)).toBeTruthy();
  });

  it("should render helperText when value is false and helperText prop is provided", () => {
    const help = "Activation Legend";
    render(<FormSwitch label="Test" value={false} onValueChange={() => {}} helperText={help} />);
    expect(screen.getByText(help)).toBeTruthy();
  });

  it("should not render warning when value is false", () => {
    const warning = "Deactivation Warning";
    render(<FormSwitch label="Test" value={false} onValueChange={() => {}} warning={warning} />);
    expect(screen.queryByText(warning)).toBeNull();
  });
});
