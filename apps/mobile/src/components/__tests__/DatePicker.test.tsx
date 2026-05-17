import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { DatePicker } from "../DatePicker";

describe("DatePicker", () => {
  it("should render with accessibilityLabel", () => {
    render(<DatePicker value={new Date()} onChange={() => {}} accessibilityLabel="Select date" />);

    expect(screen.getByLabelText("Select date")).toBeTruthy();
  });

  it("should render with accessibilityHint", () => {
    render(
      <DatePicker
        value={new Date()}
        onChange={() => {}}
        accessibilityLabel="Select date"
        accessibilityHint="Double tap to select a date"
      />,
    );

    expect(screen.getByLabelText("Select date")).toBeTruthy();
  });

  it("should render quick select buttons", () => {
    render(<DatePicker value={new Date()} onChange={() => {}} />);

    // Quick select buttons should be present (via translation key in mock)
    const todayButton = screen.getByLabelText("orders.today");
    expect(todayButton).toBeTruthy();
  });

  it("should call onChange when date is selected", () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value={new Date()} onChange={mockOnChange} />);

    const todayButton = screen.getByLabelText("orders.today");
    fireEvent.press(todayButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should render tomorrow button", () => {
    render(<DatePicker value={new Date()} onChange={() => {}} />);

    const tomorrowButton = screen.getByLabelText("orders.tomorrow");
    expect(tomorrowButton).toBeTruthy();
  });

  it("should call onChange with tomorrow when tomorrow button pressed", () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value={new Date()} onChange={mockOnChange} />);

    const tomorrowButton = screen.getByLabelText("orders.tomorrow");
    fireEvent.press(tomorrowButton);

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it("should accept minimumDate and maximumDate props", () => {
    const minDate = new Date("2024-01-01");
    const maxDate = new Date("2024-12-31");

    render(
      <DatePicker
        value={new Date()}
        onChange={() => {}}
        minimumDate={minDate}
        maximumDate={maxDate}
      />,
    );

    // Should render without errors
    expect(screen.getByLabelText("orders.today")).toBeTruthy();
  });

  it("should render with null value (defaults to today)", () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value={null} onChange={mockOnChange} />);

    // Should still show today button
    const todayButton = screen.getByLabelText("orders.today");
    expect(todayButton).toBeTruthy();
  });

  it("should display custom date when date is not today/tomorrow", () => {
    const customDate = new Date();
    customDate.setDate(customDate.getDate() + 5); // 5 days from now

    render(<DatePicker value={customDate} onChange={() => {}} />);

    // Custom date shows the formatted date as label (e.g., "Fri, May 22")
    expect(screen.getByText(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}$/)).toBeTruthy();
  });
});
