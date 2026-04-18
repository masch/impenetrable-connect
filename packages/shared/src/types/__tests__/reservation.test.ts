import { ReservationSchema } from "../reservation";

describe("ReservationSchema", () => {
  it("should validate a valid reservation with nested orders", () => {
    const validReservation = {
      id: 1,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      service_date: new Date(),
      time_of_day: "DINNER",
      status: "PENDING",
      orders: [
        {
          id: 10,
          reservation_id: 1,
          user_id: "550e8400-e29b-41d4-a716-446655440000",
          catalog_type_id: 1,
          global_status: "SEARCHING",
          service_date: new Date(),
          time_of_day: "DINNER",
          guest_count: 2,
          items: [{ id: 100, order_id: 10, catalog_item_id: 5, quantity: 2, price: 20 }],
          created_at: new Date(),
        },
      ],
    };
    const result = ReservationSchema.parse(validReservation);
    expect(result.status).toBe("PENDING");
    expect(result.orders).toHaveLength(1);
  });

  it("should validate a reservation without orders", () => {
    const reservationOnly = {
      id: 1,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      service_date: new Date(),
      time_of_day: "DINNER",
      status: "PENDING",
    };
    const result = ReservationSchema.parse(reservationOnly);
    expect(result.orders).toBeUndefined();
  });
});
