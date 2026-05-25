import { describe, it, expect } from "bun:test";
import {
  ReservationSchema,
  CreateReservationInputSchema,
  UpdateReservationInputSchema,
} from "../reservation";

const UUID_A = "550e8400-e29b-41d4-a716-446655440001";
const UUID_B = "550e8400-e29b-41d4-a716-446655440010";
const UUID_C = "550e8400-e29b-41d4-a716-446655440100";
const UUID_D = "550e8400-e29b-41d4-a716-446655440200";
const USER_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("ReservationSchema", () => {
  it("should validate a valid reservation with nested orders (UUIDs)", () => {
    const validReservation = {
      zzz_id: UUID_A,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T09:30:00-03:00",
      zzz_time_of_day: "DINNER",
      zzz_status: "CREATED",
      zzz_orders: [
        {
          zzz_id: UUID_B,
          zzz_reservation_id: UUID_A,
          zzz_product_category_id: 1,
          zzz_global_status: "SEARCHING",
          zzz_items: [
            {
              zzz_id: UUID_C,
              zzz_order_id: UUID_B,
              zzz_catalog_item_id: 5,
              zzz_quantity: 2,
              zzz_price: 20,
            },
          ],
          zzz_created_at: new Date(),
          zzz_notify_whatsapp: false,
        },
      ],
    };
    const result = ReservationSchema.parse(validReservation);
    expect(result.zzz_status).toBe("CREATED");
    expect(result.zzz_orders).toHaveLength(1);
    expect(result.zzz_service_at).toBe("2024-01-15T09:30:00-03:00");
  });

  it("should validate a reservation without orders", () => {
    const reservationOnly = {
      zzz_id: UUID_D,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T19:00:00-03:00",
      zzz_time_of_day: "DINNER",
      zzz_status: "CREATED",
    };
    const result = ReservationSchema.parse(reservationOnly);
    expect(result.zzz_status).toBe("CREATED");
    expect(result.zzz_orders).toBeUndefined();
    expect(result.zzz_service_at).toBe("2024-01-15T19:00:00-03:00");
  });

  it("should validate ISO datetime with timezone offset", () => {
    const reservation = {
      zzz_id: UUID_A,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T12:30:00-03:00",
      zzz_time_of_day: "LUNCH",
      zzz_status: "CREATED",
    };
    const result = ReservationSchema.parse(reservation);
    expect(result.zzz_service_at).toBe("2024-01-15T12:30:00-03:00");
  });

  it("should validate ISO datetime with Z suffix (UTC)", () => {
    const reservation = {
      zzz_id: UUID_A,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T15:30:00Z",
      zzz_time_of_day: "LUNCH",
      zzz_status: "CREATED",
    };
    const result = ReservationSchema.parse(reservation);
    expect(result.zzz_service_at).toBe("2024-01-15T15:30:00Z");
  });

  it("should validate ISO datetime with milliseconds", () => {
    const reservation = {
      zzz_id: UUID_A,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T20:30:00.123-03:00",
      zzz_time_of_day: "DINNER",
      zzz_status: "CREATED",
    };
    const result = ReservationSchema.parse(reservation);
    expect(result.zzz_service_at).toBe("2024-01-15T20:30:00.123-03:00");
  });

  it("should validate ISO datetime with positive offset", () => {
    const reservation = {
      zzz_id: UUID_A,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T09:30:00+05:30",
      zzz_time_of_day: "BREAKFAST",
      zzz_status: "CREATED",
    };
    const result = ReservationSchema.parse(reservation);
    expect(result.zzz_service_at).toBe("2024-01-15T09:30:00+05:30");
  });

  it("should reject numeric ID instead of UUID", () => {
    const invalid = {
      zzz_id: 1,
      zzz_user_id: USER_UUID,
      zzz_service_at: "2024-01-15T09:30:00-03:00",
      zzz_time_of_day: "LUNCH",
      zzz_status: "CREATED",
    };
    expect(() => ReservationSchema.parse(invalid)).toThrow();
  });
});

describe("CreateReservationInputSchema", () => {
  it("should validate a valid create input", () => {
    const input = {
      zzz_service_at: "2025-06-15T12:00:00Z",
      zzz_time_of_day: "LUNCH",
    };
    const result = CreateReservationInputSchema.parse(input);
    expect(result.zzz_service_at).toBe("2025-06-15T12:00:00Z");
    expect(result.zzz_guest_count).toBe(1);
  });

  it("should accept optional guest_count", () => {
    const input = {
      zzz_service_at: "2025-06-15T12:00:00Z",
      zzz_time_of_day: "DINNER",
      zzz_guest_count: 4,
    };
    const result = CreateReservationInputSchema.parse(input);
    expect(result.zzz_guest_count).toBe(4);
  });

  it("should reject invalid datetime format", () => {
    const input = {
      zzz_service_at: "not-a-datetime",
      zzz_time_of_day: "LUNCH",
    };
    expect(() => CreateReservationInputSchema.parse(input)).toThrow();
  });
});

describe("UpdateReservationInputSchema", () => {
  it("should validate a valid update input", () => {
    const input = { zzz_guest_count: 3 };
    const result = UpdateReservationInputSchema.parse(input);
    expect(result.zzz_guest_count).toBe(3);
  });

  it("should reject empty body", () => {
    expect(() => UpdateReservationInputSchema.parse({})).toThrow();
  });
});
