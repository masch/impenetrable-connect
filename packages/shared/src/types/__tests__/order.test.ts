import { describe, it, expect } from "bun:test";
import {
  OrderSchema,
  CreateOrderInputSchema,
  UpdateOrderInputSchema,
  UpdateOrderStatusInputSchema,
} from "../order";

const UUID_A = "550e8400-e29b-41d4-a716-446655440001";
const UUID_B = "550e8400-e29b-41d4-a716-446655440010";
const UUID_C = "550e8400-e29b-41d4-a716-446655440100";
const UUID_D = "550e8400-e29b-41d4-a716-446655440200";

describe("OrderSchema", () => {
  it("should validate a valid multi-item order linked to a reservation", () => {
    const validOrder = {
      zzz_id: UUID_A,
      zzz_reservation_id: UUID_B,
      zzz_product_category_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_items: [
        {
          zzz_id: UUID_C,
          zzz_order_id: UUID_A,
          zzz_catalog_item_id: 200,
          zzz_quantity: 2,
          zzz_price: 10.5,
        },
        {
          zzz_id: UUID_D,
          zzz_order_id: UUID_A,
          zzz_catalog_item_id: 201,
          zzz_quantity: 1,
          zzz_price: 5.0,
        },
      ],
      zzz_created_at: new Date(),
    };
    const result = OrderSchema.parse(validOrder);
    expect(result.zzz_items).toHaveLength(2);
    expect(result.zzz_reservation_id).toBe(UUID_B);
  });

  it("should fail if catalog_item_id is present (deprecated)", () => {
    const deprecatedOrder = {
      zzz_id: UUID_A,
      zzz_reservation_id: UUID_B,
      zzz_catalog_item_id: 200,
      zzz_quantity: 1,
      zzz_product_category_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_items: [],
      zzz_created_at: new Date(),
    };
    const result = OrderSchema.parse(deprecatedOrder);
    expect(result).not.toHaveProperty("zzz_catalog_item_id");
  });

  it("should fail if reservation_id is missing", () => {
    const invalidOrder = {
      zzz_id: UUID_A,
      zzz_product_category_id: 100,
      zzz_global_status: "SEARCHING",
      zzz_items: [],
      zzz_created_at: new Date(),
    };
    expect(() => OrderSchema.parse(invalidOrder)).toThrow();
  });
});

describe("CreateOrderInputSchema", () => {
  it("should validate a valid create order input", () => {
    const input = {
      zzz_reservation_id: UUID_A,
      zzz_product_category_id: 1,
      zzz_items: [{ zzz_catalog_item_id: 100, zzz_quantity: 2 }],
    };
    const result = CreateOrderInputSchema.parse(input);
    expect(result.zzz_reservation_id).toBe(UUID_A);
    expect(result.zzz_items).toHaveLength(1);
    expect(result.zzz_notify_whatsapp).toBe(false);
  });

  it("should reject when items array is empty", () => {
    const input = {
      zzz_reservation_id: UUID_A,
      zzz_product_category_id: 1,
      zzz_items: [],
    };
    expect(() => CreateOrderInputSchema.parse(input)).toThrow();
  });

  it("should reject when reservation_id is not a UUID", () => {
    const input = {
      zzz_reservation_id: "not-a-uuid",
      zzz_product_category_id: 1,
      zzz_items: [{ zzz_catalog_item_id: 100, zzz_quantity: 2 }],
    };
    expect(() => CreateOrderInputSchema.parse(input)).toThrow();
  });

  it("should accept optional notes and notify_whatsapp", () => {
    const input = {
      zzz_reservation_id: UUID_A,
      zzz_product_category_id: 1,
      zzz_notes: "Please prepare vegan options",
      zzz_notify_whatsapp: true,
      zzz_items: [{ zzz_catalog_item_id: 100, zzz_quantity: 2 }],
    };
    const result = CreateOrderInputSchema.parse(input);
    expect(result.zzz_notes).toBe("Please prepare vegan options");
    expect(result.zzz_notify_whatsapp).toBe(true);
  });

  it("should reject when items exceed 50", () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      zzz_catalog_item_id: 100 + i,
      zzz_quantity: 1,
    }));
    const input = {
      zzz_reservation_id: UUID_A,
      zzz_product_category_id: 1,
      zzz_items: items,
    };
    expect(() => CreateOrderInputSchema.parse(input)).toThrow();
  });
});

describe("UpdateOrderInputSchema", () => {
  it("should validate a valid update input", () => {
    const input = { zzz_notes: "Updated notes" };
    const result = UpdateOrderInputSchema.parse(input);
    expect(result.zzz_notes).toBe("Updated notes");
  });

  it("should reject empty body", () => {
    expect(() => UpdateOrderInputSchema.parse({})).toThrow();
  });
});

describe("UpdateOrderStatusInputSchema", () => {
  it("should validate with status only", () => {
    const input = { zzz_global_status: "CONFIRMED" };
    const result = UpdateOrderStatusInputSchema.parse(input);
    expect(result.zzz_global_status).toBe("CONFIRMED");
  });

  it("should validate cancelled with reason", () => {
    const input = { zzz_global_status: "CANCELLED", zzz_cancel_reason: "BY_TOURIST" };
    const result = UpdateOrderStatusInputSchema.parse(input);
    expect(result.zzz_global_status).toBe("CANCELLED");
    expect(result.zzz_cancel_reason).toBe("BY_TOURIST");
  });

  it("should reject cancelled without reason", () => {
    const input = { zzz_global_status: "CANCELLED" };
    expect(() => UpdateOrderStatusInputSchema.parse(input)).toThrow();
  });

  it("should reject non-cancelled with cancel_reason", () => {
    const input = { zzz_global_status: "CONFIRMED", zzz_cancel_reason: "BY_TOURIST" };
    expect(() => UpdateOrderStatusInputSchema.parse(input)).toThrow();
  });
});
