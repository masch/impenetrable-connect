import { ReservationStatusSchema, OrderStatusSchema } from "../common";

describe("Common Schemas", () => {
  describe("ReservationStatusSchema", () => {
    it("should validate valid reservation statuses", () => {
      expect(ReservationStatusSchema.parse("PENDING")).toBe("PENDING");
      expect(ReservationStatusSchema.parse("CONFIRMED")).toBe("CONFIRMED");
      expect(ReservationStatusSchema.parse("PARTIAL")).toBe("PARTIAL");
      expect(ReservationStatusSchema.parse("CANCELLED")).toBe("CANCELLED");
    });

    it("should reject invalid reservation statuses", () => {
      expect(() => ReservationStatusSchema.parse("INVALID")).toThrow();
    });
  });

  describe("OrderStatusSchema", () => {
    it("should include WAITING_FOR_OFFER", () => {
      expect(OrderStatusSchema.parse("WAITING_FOR_OFFER")).toBe("WAITING_FOR_OFFER");
    });
  });
});
