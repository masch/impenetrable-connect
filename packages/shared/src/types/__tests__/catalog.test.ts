import { CatalogItemSchema } from "../catalog";

describe("CatalogItemSchema", () => {
  it("should validate a standard catalog item", () => {
    const validItem = {
      id: 1,
      catalog_type_id: 10,
      name_i18n: { es: "Guiso" },
      description_i18n: { es: "Rico" },
      price: 15.0,
      max_participants: 10,
      global_pause: false,
    };
    const result = CatalogItemSchema.parse(validItem);
    expect(result.id).toBe(1);
  });

  it("should allow catalog item without max_participants", () => {
    const masterItem = {
      id: 1,
      catalog_type_id: 10,
      name_i18n: { es: "Guiso" },
      description_i18n: { es: "Rico" },
      price: 15.0,
      max_participants: null,
      global_pause: false,
    };
    const result = CatalogItemSchema.parse(masterItem);
    expect(result.max_participants).toBeNull();
  });
});
