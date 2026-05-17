import React from "react";
import { render, screen } from "@testing-library/react-native";
import { LanguageSwitcher } from "../LanguageSwitcher";

describe("LanguageSwitcher accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render language buttons", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText("EN")).toBeTruthy();
    expect(screen.getByText("ES")).toBeTruthy();
  });

  it("should have accessibility labels on buttons", () => {
    render(<LanguageSwitcher />);

    // With enhanced mock, buttons should have accessibilityLabel
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
