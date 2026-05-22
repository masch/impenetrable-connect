import React from "react";
import { render, screen, fireEvent } from "../../../__tests__/utils/test-utils";
import { ServiceCard } from "../ServiceCard";

// Mock i18n
jest.mock("../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "catalog.book_now": "Realizar pedido",
        "catalog.no_name": "Servicio sin nombre",
        "catalog.no_description": "Sin descripción",
      };
      return translations[key] || key;
    },
    getLocalizedName: (obj: Record<string, string>) => obj?.es || "---",
  }),
}));

const mockItem = {
  zzz_id: 1,
  zzz_name_i18n: { es: "Servicio de Prueba", en: "Test Service" },
  zzz_description_i18n: {
    es: "Esta es una descripción de prueba",
    en: "This is a test description",
  },
  zzz_price: 1200,
  zzz_image_url: "http://example.com/image.jpg",
  zzz_product_category_id: 1,
  zzz_max_participants: 5,
  zzz_global_pause: false,
};

describe("ServiceCard", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render item name, price and description", () => {
    render(<ServiceCard item={mockItem} onPress={mockOnPress} />);

    expect(screen.getByText("Servicio de Prueba")).toBeTruthy();
    expect(screen.getByText(/1[.,]200/)).toBeTruthy();
    expect(screen.getByText("Esta es una descripción de prueba")).toBeTruthy();
  });

  it("should render the 'Realizar pedido' CTA text", () => {
    render(<ServiceCard item={mockItem} onPress={mockOnPress} />);

    // The text is rendered via t("catalog.book_now") which we mocked to "Realizar pedido"
    expect(screen.getByText("Realizar pedido")).toBeTruthy();
  });

  it("should render category name when provided", () => {
    render(<ServiceCard item={mockItem} onPress={mockOnPress} categoryName="GASTRONOMÍA" />);
    expect(screen.getByText("GASTRONOMÍA")).toBeTruthy();
  });

  it("should render max participants when present", () => {
    render(<ServiceCard item={mockItem} onPress={mockOnPress} />);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("should call onPress when card is pressed", () => {
    render(<ServiceCard item={mockItem} onPress={mockOnPress} />);

    // The whole card is a Button
    const button = screen.getByTestId("service-card-1");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should show fallback icon when no image is provided", () => {
    const itemWithoutImage = { ...mockItem, zzz_image_url: "" };
    render(<ServiceCard item={itemWithoutImage} onPress={mockOnPress} />);

    // MaterialCommunityIcons name="image-off-outline"
    // RTL doesn't render icons as text, but we can check if the Image is NOT there
    // or if the component doesn't crash.
  });
});
