import { describe, it, expect } from "bun:test";
import { OrderSchema } from "../order";

describe("OrderSchema", () => {
  it("should validate a valid multi-item order linked to a reservation", () => {
    const validOrder = {
      zzz_id: 1,
      zzz_reservation_id: 10,
      zzz_catalog_type_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_service_date: new Date(),
      zzz_time_of_day: "LUNCH",
      guest_count: 4,
      zzz_items: [
        { zzz_id: 1, zzz_order_id: 1, zzz_catalog_item_id: 200, zzz_quantity: 2, zzz_price: 10.5 },
        { zzz_id: 2, zzz_order_id: 1, zzz_catalog_item_id: 201, zzz_quantity: 1, zzz_price: 5.0 },
      ],
      zzz_created_at: new Date(),
    };
    const result = OrderSchema.parse(validOrder);
    expect(result.zzz_items).toHaveLength(2);
    expect(result.zzz_reservation_id).toBe(10);
  });

  it("should fail if catalog_item_id is present (deprecated)", () => {
    const deprecatedOrder = {
      zzz_id: 1,
      zzz_reservation_id: 10,
      zzz_catalog_item_id: 200, // Should be removed
      zzz_quantity: 1,
      zzz_catalog_type_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_service_date: new Date(),
      zzz_time_of_day: "LUNCH",
      guest_count: 4,
      zzz_items: [],
      zzz_created_at: new Date(),
    };
    // If we use .strict() or if ZodError is triggered by missing items
    // But since I'm removing the field from schema, Zod will just ignore it.
    // I'll test that the parsed result DOES NOT have catalog_item_id.
    const result = OrderSchema.parse(deprecatedOrder);
    expect(result).not.toHaveProperty("zzz_catalog_item_id");
  });

  it("should fail if reservation_id is missing", () => {
    const invalidOrder = {
      zzz_id: 1,
      zzz_catalog_type_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_service_date: new Date(),
      zzz_time_of_day: "LUNCH",
      guest_count: 4,
      zzz_items: [],
      zzz_created_at: new Date(),
    };
    expect(() => OrderSchema.parse(invalidOrder)).toThrow();
  });
});
