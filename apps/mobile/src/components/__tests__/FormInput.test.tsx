import React from "react";
import { render, screen } from "@testing-library/react-native";
import { FormInput } from "../FormInput";

describe("FormInput accessibility", () => {
  it("should render with label", () => {
    render(<FormInput label="Test Label" value="" onChangeText={() => {}} />);

    expect(screen.getByText("Test Label")).toBeTruthy();
  });

  it("should render error message when provided", () => {
    render(
      <FormInput label="Test Label" value="" onChangeText={() => {}} error="This is required" />,
    );

    expect(screen.getByText("This is required")).toBeTruthy();
  });

  it("should show required asterisk when required prop is true", () => {
    render(<FormInput label="Test Label" value="" onChangeText={() => {}} required />);

    expect(screen.getByText("Test Label *")).toBeTruthy();
  });
});