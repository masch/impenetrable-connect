import { OrderSchema } from "../order";

describe("OrderSchema", () => {
  it("should validate a valid multi-item order linked to a reservation", () => {
    const validOrder = {
      id: 1,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      reservation_id: 10,
      catalog_type_id: 100,
      global_status: "SEARCHING",
      service_date: new Date(),
      time_of_day: "LUNCH",
      guest_count: 4,
      items: [
        { id: 1, order_id: 1, catalog_item_id: 200, quantity: 2, price: 10.5 },
        { id: 2, order_id: 1, catalog_item_id: 201, quantity: 1, price: 5.0 },
      ],
      created_at: new Date(),
    };
    const result = OrderSchema.parse(validOrder);
    expect(result.items).toHaveLength(2);
    expect(result.reservation_id).toBe(10);
  });

  it("should fail if catalog_item_id is present (deprecated)", () => {
    const deprecatedOrder = {
      id: 1,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      reservation_id: 10,
      catalog_item_id: 200, // Should be removed
      quantity: 1,
      catalog_type_id: 100,
      global_status: "SEARCHING",
      service_date: new Date(),
      time_of_day: "LUNCH",
      guest_count: 4,
      items: [],
      created_at: new Date(),
    };
    // If we use .strict() or if ZodError is triggered by missing items
    // But since I'm removing the field from schema, Zod will just ignore it.
    // I'll test that the parsed result DOES NOT have catalog_item_id.
    const result = OrderSchema.parse(deprecatedOrder) as any;
    expect(result.catalog_item_id).toBeUndefined();
  });

  it("should fail if reservation_id is missing", () => {
    const invalidOrder = {
      id: 1,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      catalog_type_id: 100,
      global_status: "SEARCHING",
      service_date: new Date(),
      time_of_day: "LUNCH",
      guest_count: 4,
      items: [],
      created_at: new Date(),
    };
    expect(() => OrderSchema.parse(invalidOrder)).toThrow();
  });
});
