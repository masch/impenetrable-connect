import {
  formatCurrency,
  formatDate,
  getRelativeDateLabel,
  isSameDay,
  formatMoment,
  toISODate,
  getNativeLocale,
  formatUserDisplayName,
} from "../formatters";
import { useLocaleStore } from "../../stores/locale.store";

// Mock the locale store
jest.mock("../../stores/locale.store", () => ({
  useLocaleStore: {
    getState: jest.fn(),
  },
}));

describe("Formatters Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: Spanish locale
    (useLocaleStore.getState as jest.Mock).mockReturnValue({ locale: "es" });
  });

  describe("formatCurrency", () => {
    it("should format ARS currency correctly in Spanish", () => {
      const result = formatCurrency(28500);
      // Use regex to be robust against NBSP (\u00A0)
      expect(result).toMatch(/\$?\s*28[.,]500/);
    });

    it("should format correctly in English", () => {
      (useLocaleStore.getState as jest.Mock).mockReturnValue({ locale: "en" });
      const result = formatCurrency(28500);
      // US style usually $28,500
      expect(result).toMatch(/\$?\s*28[.,]500/);
    });
  });

  describe("formatDate", () => {
    it("should format date according to options", () => {
      const date = new Date(2026, 3, 20); // April 20, 2026
      const result = formatDate(date, { month: "long", year: "numeric" });
      // In Spanish it should contain 'abril' and '2026'
      expect(result.toLowerCase()).toContain("abril");
      expect(result).toContain("2026");
    });
  });

  describe("isSameDay", () => {
    it("should return true for same day", () => {
      const d1 = new Date(2026, 3, 20, 10, 0);
      const d2 = new Date(2026, 3, 20, 22, 0);
      expect(isSameDay(d1, d2)).toBe(true);
    });

    it("should return false for different days", () => {
      const d1 = new Date(2026, 3, 20);
      const d2 = new Date(2026, 3, 21);
      expect(isSameDay(d1, d2)).toBe(false);
    });
  });

  describe("getRelativeDateLabel", () => {
    const t = jest.fn((key) => key);

    it("should return 'Hoy' for current date", () => {
      const today = new Date();
      expect(getRelativeDateLabel(today, t)).toBe("orders.today");
    });

    it("should return 'Mañana' for next day", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getRelativeDateLabel(tomorrow, t)).toBe("orders.tomorrow");
    });

    it("should return formatted date for other days", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const result = getRelativeDateLabel(future, t);
      expect(result).not.toBe("orders.today");
      expect(result).not.toBe("orders.tomorrow");
    });
  });

  describe("toISODate", () => {
    it("should return YYYY-MM-DD in LOCAL time", () => {
      // Create a date that might shift in UTC (e.g., late at night)
      const date = new Date(2026, 3, 20, 23, 30); // April 20, 11:30 PM
      const result = toISODate(date);

      expect(result).toBe("2026-04-20");
      // Verify it doesn't match UTC if UTC shifted to next day
      const utcDay = date.getUTCDate();
      if (utcDay !== 20) {
        expect(result).not.toBe(date.toISOString().split("T")[0]);
      }
    });

    it("should pad single digits with zeros", () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(toISODate(date)).toBe("2026-01-05");
    });
  });

  describe("formatMoment", () => {
    const t = jest.fn((key) => `Translated:${key}`);

    it("should return translated label for a given moment", () => {
      expect(formatMoment("LUNCH", t)).toBe("Translated:catalog.reservation.moments.LUNCH");
    });
  });

  describe("getNativeLocale", () => {
    it("should map 'es' to 'es-AR'", () => {
      expect(getNativeLocale("es")).toBe("es-AR");
    });

    it("should map 'en' to 'en-US'", () => {
      expect(getNativeLocale("en")).toBe("en-US");
    });

    it("should fallback to 'en-US' for unknown locales", () => {
      expect(getNativeLocale("fr")).toBe("en-US");
    });
  });

  describe("formatUserDisplayName", () => {
    it("should extract handle from email", () => {
      expect(formatUserDisplayName("maria@river-tours.com")).toBe("maria");
    });

    it("should return alias as is if no @", () => {
      expect(formatUserDisplayName("Viaje Familiar")).toBe("Viaje Familiar");
    });

    it("should return empty string for null or undefined", () => {
      expect(formatUserDisplayName(null)).toBe("");
      expect(formatUserDisplayName(undefined)).toBe("");
    });
  });
});
