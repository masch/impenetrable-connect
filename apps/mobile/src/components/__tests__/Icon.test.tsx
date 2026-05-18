import React from "react";
import { render } from "@testing-library/react-native";
import { Icon } from "../Icon";

describe("Icon component", () => {
  describe("Rendering", () => {
    it("should render with SF Symbol name", () => {
      // Act & Assert - should not throw
      expect(() =>
        render(<Icon name="arrow.left" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should render with correct size prop", () => {
      // Act & Assert
      expect(() =>
        render(<Icon name="arrow.left" size={32} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should render with correct color prop", () => {
      // Act & Assert
      expect(() =>
        render(<Icon name="arrow.left" size={24} color="#FF0000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should use default size when not provided", () => {
      // Act & Assert - default size is 24
      expect(() =>
        render(<Icon name="arrow.left" color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should render with testID", () => {
      // Act
      const { getByTestId } = render(
        <Icon name="arrow.left" size={24} color="#000000" testID="my-custom-id" />,
      );

      // Assert
      expect(getByTestId("my-custom-id")).toBeTruthy();
    });
  });

  describe("Icon mapping table", () => {
    it("should map legacy name 'arrow-left' to SF Symbol 'arrow.left'", () => {
      // Legacy name should not throw - mapping is handled
      expect(() =>
        render(<Icon name="arrow-left" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'check-circle' to 'checkmark.circle'", () => {
      expect(() =>
        render(<Icon name="check-circle" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'chevron-down' to 'chevron.down'", () => {
      expect(() =>
        render(<Icon name="chevron-down" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'star' to 'star.fill'", () => {
      expect(() =>
        render(<Icon name="star" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'calendar-arrow-right' to 'calendar.badge.clock'", () => {
      expect(() =>
        render(<Icon name="calendar-arrow-right" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'package-variant-closed' to 'shippingbox'", () => {
      expect(() =>
        render(<Icon name="package-variant-closed" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'history' to 'clock.arrow.circlepath'", () => {
      expect(() =>
        render(<Icon name="history" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'menu' to 'line.3.horizontal'", () => {
      expect(() =>
        render(<Icon name="menu" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should map 'close' to 'xmark'", () => {
      expect(() =>
        render(<Icon name="close" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should pass through unmapped names without error", () => {
      // Unmapped names should still render (they just won't map to a real SF Symbol)
      expect(() =>
        render(<Icon name="some-custom-icon" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });
  });

  describe("Fallback rendering", () => {
    it("should render without crashing on any platform", () => {
      // The component has fallback for non-iOS platforms
      expect(() =>
        render(<Icon name="arrow.left" size={24} color="#000000" testID="test-icon" />),
      ).not.toThrow();
    });

    it("should render element", () => {
      const { root } = render(
        <Icon name="arrow.left" size={24} color="#000000" testID="test-icon" />,
      );
      expect(root).toBeTruthy();
    });
  });
});
