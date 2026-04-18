import { OrderItemSchema } from "../order-item";

describe("OrderItemSchema", () => {
  it("should validate a valid order item", () => {
    const validItem = {
      id: 1,
      order_id: 10,
      catalog_item_id: 100,
      quantity: 2,
      price: 15.5,
    };
    expect(OrderItemSchema.parse(validItem)).toEqual(validItem);
  });

  it("should fail with invalid quantity", () => {
    const invalidItem = {
      id: 1,
      order_id: 10,
      catalog_item_id: 100,
      quantity: 0,
      price: 15.5,
    };
    expect(() => OrderItemSchema.parse(invalidItem)).toThrow();
  });

  it("should allow price 0", () => {
    const freeItem = {
      id: 1,
      order_id: 10,
      catalog_item_id: 100,
      quantity: 1,
      price: 0,
    };
    expect(OrderItemSchema.parse(freeItem)).toEqual(freeItem);
  });
});
