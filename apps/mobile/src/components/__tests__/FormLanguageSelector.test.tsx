import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FormLanguageSelector } from "../FormLanguageSelector";

describe("FormLanguageSelector", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with label", () => {
    render(
      <FormLanguageSelector
        label="Supported Languages"
        selectedLanguages={["es"]}
        onToggle={mockOnToggle}
        availableLanguages={["es", "en"]}
      />,
    );

    expect(screen.getByText("Supported Languages")).toBeTruthy();
  });

  it("should render language buttons", () => {
    render(
      <FormLanguageSelector
        label="Supported Languages"
        selectedLanguages={["es"]}
        onToggle={mockOnToggle}
        availableLanguages={["es", "en"]}
      />,
    );

    expect(screen.getByText("es")).toBeTruthy();
    expect(screen.getByText("en")).toBeTruthy();
  });

  it("should call onToggle when language button is pressed", () => {
    render(
      <FormLanguageSelector
        label="Supported Languages"
        selectedLanguages={["es"]}
        onToggle={mockOnToggle}
        availableLanguages={["es", "en"]}
      />,
    );

    fireEvent.press(screen.getByText("en"));
    expect(mockOnToggle).toHaveBeenCalledWith("en");
  });

  it("should render error message when provided", () => {
    render(
      <FormLanguageSelector
        label="Supported Languages"
        selectedLanguages={[]}
        onToggle={mockOnToggle}
        error="At least one language is required"
      />,
    );

    expect(screen.getByText("At least one language is required")).toBeTruthy();
  });
});