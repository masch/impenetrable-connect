import { describe, it, expect } from "bun:test";
import { OrderItemSchema } from "../order-item";

const UUID_A = "550e8400-e29b-41d4-a716-446655440001";
const UUID_B = "550e8400-e29b-41d4-a716-446655440010";

describe("OrderItemSchema", () => {
  it("should validate a valid order item with UUIDs", () => {
    const validItem = {
      zzz_id: UUID_A,
      zzz_order_id: UUID_B,
      zzz_catalog_item_id: 100,
      zzz_quantity: 2,
      zzz_price: 15.5,
    };
    expect(OrderItemSchema.parse(validItem)).toEqual(validItem);
  });

  it("should fail with invalid quantity", () => {
    const invalidItem = {
      zzz_id: UUID_A,
      zzz_order_id: UUID_B,
      zzz_catalog_item_id: 100,
      zzz_quantity: 0,
      zzz_price: 15.5,
    };
    expect(() => OrderItemSchema.parse(invalidItem)).toThrow();
  });

  it("should allow price 0", () => {
    const freeItem = {
      zzz_id: UUID_A,
      zzz_order_id: UUID_B,
      zzz_catalog_item_id: 100,
      zzz_quantity: 1,
      zzz_price: 0,
    };
    expect(OrderItemSchema.parse(freeItem)).toEqual(freeItem);
  });

  it("should reject numeric ID instead of UUID", () => {
    const invalidItem = {
      zzz_id: 1,
      zzz_order_id: UUID_B,
      zzz_catalog_item_id: 100,
      zzz_quantity: 1,
      zzz_price: 10,
    };
    expect(() => OrderItemSchema.parse(invalidItem)).toThrow();
  });

  it("should reject non-UUID order_id", () => {
    const invalidItem = {
      zzz_id: UUID_A,
      zzz_order_id: 10,
      zzz_catalog_item_id: 100,
      zzz_quantity: 1,
      zzz_price: 10,
    };
    expect(() => OrderItemSchema.parse(invalidItem)).toThrow();
  });
});
