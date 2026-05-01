import { describe, it, expect } from "bun:test";
import { CatalogItemSchema } from "../catalog";

describe("CatalogItemSchema", () => {
  it("should validate a standard catalog item", () => {
    const validItem = {
      zzz_id: 1,
      zzz_catalog_type_id: 10,
      zzz_catalog_category_id: 1,
      zzz_name_i18n: { es: "Guiso" },
      zzz_description_i18n: { es: "Rico" },
      zzz_price: 15.0,
      zzz_max_participants: 10,
      zzz_global_pause: false,
    };
    const result = CatalogItemSchema.parse(validItem);
    expect(result.zzz_id).toBe(1);
  });

  it("should allow catalog item without max_participants", () => {
    const masterItem = {
      zzz_id: 1,
      zzz_catalog_type_id: 10,
      zzz_catalog_category_id: 1,
      zzz_name_i18n: { es: "Guiso" },
      zzz_description_i18n: { es: "Rico" },
      zzz_price: 15.0,
      zzz_max_participants: 20,
      zzz_global_pause: false,
    };
    const result = CatalogItemSchema.parse(masterItem);
    expect(result.zzz_max_participants).toBe(20);
  });
});
