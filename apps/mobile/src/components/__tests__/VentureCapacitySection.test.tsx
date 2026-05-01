import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import VentureCapacitySection from "../VentureCapacitySection";

// Mock hooks
jest.mock("../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe("VentureCapacitySection", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render capacity adjustment UI with current value", () => {
    render(
      <VentureCapacitySection
        capacity={50}
        onValueChange={mockOnValueChange}
        originalCapacity={50}
      />,
    );

    expect(screen.getByText("venture.capacity_label")).toBeTruthy();
    expect(screen.getByTestId("capacity-text").props.children).toBe(50);
  });

  it("should call onValueChange when plus button is pressed", () => {
    render(
      <VentureCapacitySection
        capacity={50}
        onValueChange={mockOnValueChange}
        originalCapacity={50}
      />,
    );

    const plusButton = screen.getByTestId("plus-button");
    fireEvent.press(plusButton);

    expect(mockOnValueChange).toHaveBeenCalledWith(51);
  });

  it("should call onValueChange when minus button is pressed", () => {
    render(
      <VentureCapacitySection
        capacity={50}
        onValueChange={mockOnValueChange}
        originalCapacity={50}
      />,
    );

    const minusButton = screen.getByTestId("minus-button");
    fireEvent.press(minusButton);

    expect(mockOnValueChange).toHaveBeenCalledWith(49);
  });

  it("should display original capacity as reference", () => {
    render(
      <VentureCapacitySection
        capacity={55}
        onValueChange={mockOnValueChange}
        originalCapacity={50}
      />,
    );

    // Should show 55 as current editable value and 50 as reference
    expect(screen.getByText("50")).toBeTruthy();
    expect(screen.getByText("55")).toBeTruthy();
  });
});
