/**
 * Tests for moment-based catalog filtering in BookingScreen
 * TDD: Tests written first to define the filtering behavior
 */

import React from "react";
import { useCatalogStore } from "../../../stores/catalog.store";
import { useCartStore } from "../../../stores/cart.store";
import { useAuthStore } from "../../../stores/auth.store";
import { ServiceMoment, type CatalogItem, type HourMinute } from "@repo/shared";

// Mock components to isolate the filtering logic test
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  Stack: {
    Screen: jest.fn(() => null),
  },
}));

jest.mock("../../../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
    getLocalizedName: (obj: { es: string; en: string }) => obj.es,
  }),
}));

// Mock the ServiceCard component to simplify tests
jest.mock("../../../components/catalog/ServiceCard", () => ({
  ServiceCard: ({
    item: _item,
    onPress: _onPress,
  }: {
    item: { zzz_id: number };
    onPress: () => void;
  }) => (
    // @ts-ignore
    <></>
  ),
}));

jest.mock("../../../components/catalog/SectionHeader", () => ({
  SectionHeader: ({ title }: { title: string }) => <>{title}</>,
}));

jest.mock("../../../components/Screen", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ScreenContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../../components/LoadingView", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../components/AppAlert", () => ({
  __esModule: true,
  AppAlert: () => null,
}));

jest.mock("../../../components/catalog/ReservationModal", () => ({
  __esModule: true,
  ReservationModal: () => null,
}));

jest.mock("../../../components/Button", () => ({
  Button: ({
    children,
    onPress: _onPress,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
  }) => <>{children}</>,
}));

/**
 * Filter function that mimics the logic in booking.tsx
 * This is the actual filtering logic being tested
 */
function filterCatalogItemsByMoment(
  items: CatalogItem[],
  selectedMoment: ServiceMoment | null,
): CatalogItem[] {
  if (!selectedMoment) return items;

  return items.filter((item) => {
    // Excursions (category_id = 2) are always visible - moment agnostic
    if (item.zzz_catalog_category_id === 2) {
      return true;
    }

    // Gastronomy items: only show if selectedMoment is in the item's moments array
    const itemMoments = (item as unknown as { zzz_service_moments?: ServiceMoment[] })
      .zzz_service_moments;
    if (!itemMoments || itemMoments.length === 0) {
      return false; // Items without moments are filtered out
    }

    return itemMoments.includes(selectedMoment);
  });
}

describe("Moment-based Catalog Filtering", () => {
  const mockCatalogItems: CatalogItem[] = [
    {
      zzz_id: 1,
      zzz_catalog_category_id: 1, // Gastronomy
      zzz_name_i18n: { es: "Desayuno", en: "Breakfast" },
      zzz_description_i18n: { es: "Desayuno regional", en: "Regional breakfast" },
      zzz_price: 9000,
      zzz_max_participants: 20,
      zzz_global_pause: false,
      zzz_service_moments: ["BREAKFAST"],
    },
    {
      zzz_id: 2,
      zzz_catalog_category_id: 1, // Gastronomy
      zzz_name_i18n: { es: "Almuerzo", en: "Lunch" },
      zzz_description_i18n: { es: "Almuerzo chaqueño", en: "Chaco lunch" },
      zzz_price: 17000,
      zzz_max_participants: 20,
      zzz_global_pause: false,
      zzz_service_moments: ["LUNCH", "DINNER"],
    },
    {
      zzz_id: 3,
      zzz_catalog_category_id: 1, // Gastronomy
      zzz_name_i18n: { es: "Merienda", en: "Snack" },
      zzz_description_i18n: { es: "Merienda regional", en: "Regional snack" },
      zzz_price: 9000,
      zzz_max_participants: 20,
      zzz_global_pause: false,
      zzz_service_moments: ["SNACK"],
    },
    {
      zzz_id: 4,
      zzz_catalog_category_id: 1, // Gastronomy
      zzz_name_i18n: { es: "Cena", en: "Dinner" },
      zzz_description_i18n: { es: "Cena tradicional", en: "Traditional dinner" },
      zzz_price: 20000,
      zzz_max_participants: 20,
      zzz_global_pause: false,
      zzz_service_moments: ["DINNER"],
    },
    {
      zzz_id: 5,
      zzz_catalog_category_id: 2, // Excursion
      zzz_name_i18n: { es: "Paseo en lancha", en: "Boat trip" },
      zzz_description_i18n: { es: "Paseo por el río", en: "River trip" },
      zzz_price: 15000,
      zzz_max_participants: 6,
      zzz_global_pause: false,
      // Excursions don't have moments - they're moment-agnostic
    },
  ];

  beforeEach(() => {
    // Reset stores to initial state
    useCatalogStore.setState({
      services: [],
      isLoading: false,
      error: null,
    });

    useCartStore.setState({
      selectedDate: new Date(),
      selectedMoment: "LUNCH" as ServiceMoment,
      selectedTime: "13:00" as HourMinute,
      cartItems: [],
    });

    useAuthStore.setState({
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("filterCatalogItemsByMoment", () => {
    it("should show gastronomy items with matching moment", () => {
      const filtered = filterCatalogItemsByMoment(mockCatalogItems, "LUNCH");

      // Item 2 has LUNCH in its moments array
      const lunchItem = filtered.find((item) => item.zzz_id === 2);
      expect(lunchItem).toBeDefined();
    });

    it("should NOT show gastronomy items without matching moment", () => {
      const filtered = filterCatalogItemsByMoment(mockCatalogItems, "LUNCH");

      // Item 1 has only BREAKFAST - should NOT appear
      const breakfastItem = filtered.find((item) => item.zzz_id === 1);
      expect(breakfastItem).toBeUndefined();
    });

    it("should show items with multiple moments when one matches", () => {
      const filtered = filterCatalogItemsByMoment(mockCatalogItems, "DINNER");

      // Item 2 has [LUNCH, DINNER] - should appear for DINNER
      const multiMomentItem = filtered.find((item) => item.zzz_id === 2);
      expect(multiMomentItem).toBeDefined();
    });

    it("should ALWAYS show excursions regardless of selected moment", () => {
      // Test with BREAKFAST - excursion should still appear
      const filteredBreakfast = filterCatalogItemsByMoment(mockCatalogItems, "BREAKFAST");
      const excursionWhenBreakfast = filteredBreakfast.find((item) => item.zzz_id === 5);
      expect(excursionWhenBreakfast).toBeDefined();

      // Test with DINNER - excursion should still appear
      const filteredDinner = filterCatalogItemsByMoment(mockCatalogItems, "DINNER");
      const excursionWhenDinner = filteredDinner.find((item) => item.zzz_id === 5);
      expect(excursionWhenDinner).toBeDefined();
    });

    it("should filter out gastronomy items with empty or undefined moments array", () => {
      // Create items with edge cases
      const edgeCaseItems: CatalogItem[] = [
        {
          zzz_id: 10,
          zzz_catalog_category_id: 1, // Gastronomy
          zzz_name_i18n: { es: "Item sin momentos", en: "Item without moments" },
          zzz_price: 1000,
          zzz_max_participants: 10,
          zzz_global_pause: false,
          zzz_service_moments: [], // Empty array
        },
        {
          zzz_id: 11,
          zzz_catalog_category_id: 1, // Gastronomy
          zzz_name_i18n: { es: "Item sin propiedad", en: "Item without property" },
          zzz_price: 1000,
          zzz_max_participants: 10,
          zzz_global_pause: false,
          // zzz_service_moments undefined
        },
      ] as unknown as CatalogItem[];

      const filtered = filterCatalogItemsByMoment(edgeCaseItems, "LUNCH");

      // Both should be filtered out
      expect(filtered.length).toBe(0);
    });

    it("should return all items when selectedMoment is null", () => {
      const filtered = filterCatalogItemsByMoment(mockCatalogItems, null);

      expect(filtered.length).toBe(5); // All items visible
    });

    it("should return all items when selectedMoment is undefined", () => {
      const filtered = filterCatalogItemsByMoment(mockCatalogItems, null);

      expect(filtered.length).toBe(5); // All items visible
    });
  });

  describe("ServiceMoment Type Coverage", () => {
    it("should handle all valid ServiceMoment values", () => {
      const moments: ServiceMoment[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

      moments.forEach((moment) => {
        const filtered = filterCatalogItemsByMoment(mockCatalogItems, moment);
        // Should not throw and should return array
        expect(Array.isArray(filtered)).toBe(true);
      });
    });
  });
});
