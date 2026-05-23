/**
 * Tests for resolveImageUrl - the bridge between API image keys and local assets.
 *
 * Covers both API mode (keys from backend DB) and mock mode (already patched with require()).
 */
import { resolveImageUrl } from "../image-assets";

describe("resolveImageUrl", () => {
  describe("API mode (keys from backend DB)", () => {
    it("should resolve known key empanadas6 to a local asset (not the original string)", () => {
      const result = resolveImageUrl("empanadas6");
      expect(result).toBeDefined();
      expect(result).not.toBe("empanadas6");
    });

    it("should resolve known key empanadas12 to a local asset", () => {
      const result = resolveImageUrl("empanadas12");
      expect(result).toBeDefined();
      expect(result).not.toBe("empanadas12");
    });

    it("should resolve known key repollo to a local asset", () => {
      const result = resolveImageUrl("repollo");
      expect(result).toBeDefined();
      expect(result).not.toBe("repollo");
    });

    it("should resolve known key pastel_calabaza to a local asset", () => {
      const result = resolveImageUrl("pastel_calabaza");
      expect(result).toBeDefined();
      expect(result).not.toBe("pastel_calabaza");
    });

    it("should resolve known key chivo_guiso to a local asset", () => {
      const result = resolveImageUrl("chivo_guiso");
      expect(result).toBeDefined();
      expect(result).not.toBe("chivo_guiso");
    });

    it("should resolve known key chivo_estofado to a local asset", () => {
      const result = resolveImageUrl("chivo_estofado");
      expect(result).toBeDefined();
      expect(result).not.toBe("chivo_estofado");
    });

    it("should pass through an unknown string key as-is (e.g. Unsplash URL)", () => {
      const url = "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400";
      const result = resolveImageUrl(url);
      expect(result).toBe(url);
    });

    it("should return undefined for null or undefined", () => {
      expect(resolveImageUrl(null)).toBeUndefined();
      expect(resolveImageUrl(undefined)).toBeUndefined();
    });
  });

  describe("Mock mode (already patched with require() numbers)", () => {
    it("should return the number as-is when passed a numeric asset", () => {
      const assetId = 42; // Simulates a require() result
      const result = resolveImageUrl(assetId);
      expect(result).toBe(42);
    });

    it("should return undefined for 0 (falsy numeric guard)", () => {
      const result = resolveImageUrl(0);
      expect(result).toBeUndefined();
    });
  });
});
