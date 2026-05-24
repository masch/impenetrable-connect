import { apiClient } from "../api-client";

jest.mock("../api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../config/env", () => ({
  __esModule: true,
  default: { API_URL: "http://test.api/v1", USE_MOCKS: false },
}));

import { createHourMinute } from "@repo/shared";
import { ProductService } from "../product.service";

describe("RestProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getServices", () => {
    it("should call apiClient.get with /services and map images", async () => {
      const mockServices = [{ zzz_id: 1, zzz_name_i18n: { en: "Service" }, zzz_image_url: null }];
      (apiClient.get as jest.Mock).mockResolvedValue(mockServices);

      const result = await ProductService.getServices();

      expect(apiClient.get).toHaveBeenCalledWith("/services");
      expect(result).toHaveLength(1);
      expect(result[0].zzz_image_url).toBeUndefined();
    });
  });

  describe("getServiceById", () => {
    it("should call apiClient.get with /services/:id", async () => {
      const mockService = { zzz_id: 5, zzz_name_i18n: { en: "Test" }, zzz_image_url: null };
      (apiClient.get as jest.Mock).mockResolvedValue(mockService);

      const result = await ProductService.getServiceById(5);

      expect(apiClient.get).toHaveBeenCalledWith("/services/5");
      // resolveImageUrl maps null to undefined
      expect(result).toEqual({ ...mockService, zzz_image_url: undefined });
    });
  });

  describe("getServicesByCategory", () => {
    it("should call apiClient.get with /services?category_id=", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await ProductService.getServicesByCategory(2);

      expect(apiClient.get).toHaveBeenCalledWith("/services?category_id=2");
    });
  });

  describe("getOrders", () => {
    it("should call apiClient.get with /orders", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await ProductService.getOrders();

      expect(apiClient.get).toHaveBeenCalledWith("/orders");
    });

    it("should append userId query param when userId is provided", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await ProductService.getOrders("user-abc");

      expect(apiClient.get).toHaveBeenCalledWith("/orders?userId=user-abc");
    });
  });

  describe("updateOrder", () => {
    it("should call apiClient.patch with /orders/:id", async () => {
      const input = { zzz_notes: "New notes" };
      const expected = { zzz_id: "order-1", zzz_notes: "New notes" };
      (apiClient.patch as jest.Mock).mockResolvedValue(expected);

      const result = await ProductService.updateOrder("order-1", input);

      expect(apiClient.patch).toHaveBeenCalledWith("/orders/order-1", { zzz_notes: "New notes" });
      expect(result).toEqual(expected);
    });
  });

  describe("updateOrderStatus", () => {
    it("should call apiClient.patch with /orders/:id/status", async () => {
      (apiClient.patch as jest.Mock).mockResolvedValue({ zzz_id: "order-1" });

      await ProductService.updateOrderStatus("order-1", "CONFIRMED");

      expect(apiClient.patch).toHaveBeenCalledWith("/orders/order-1/status", {
        status: "CONFIRMED",
      });
    });
  });

  describe("placeOrder", () => {
    it("should create reservation and order on success", async () => {
      const date = new Date("2026-05-24T12:00:00Z");
      const mockReservation = { zzz_id: "res-uuid-123" };
      const mockOrder = {
        zzz_id: "order-uuid-456",
        zzz_reservation_id: "res-uuid-123",
        zzz_catalog_type_id: 1,
        zzz_global_status: "SEARCHING",
        zzz_items: [
          {
            zzz_id: "item-1",
            zzz_order_id: "order-uuid-456",
            zzz_catalog_item_id: 1,
            zzz_quantity: 2,
            zzz_price: 1500,
          },
        ],
        zzz_notes: "Test notes",
        zzz_cancelled_at: null,
        zzz_completed_at: null,
        zzz_confirmed_at: null,
        zzz_confirmed_venture_id: null,
        zzz_notify_whatsapp: false,
        zzz_cancel_reason: null,
        zzz_created_at: date.toISOString(),
      };
      const mockServices = [
        {
          zzz_id: 1,
          zzz_product_category_id: 1,
          zzz_price: 1500,
          zzz_name_i18n: { en: "Test" },
          zzz_image_url: null,
          zzz_description_i18n: { en: "Test" },
          zzz_max_participants: 10,
          zzz_global_pause: false,
          zzz_service_moments: ["LUNCH"],
        },
      ];

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce(mockOrder);
      (apiClient.get as jest.Mock).mockResolvedValue(mockServices);

      const result = await ProductService.placeOrder(
        date,
        "LUNCH",
        [{ zzz_catalog_item_id: 1, zzz_quantity: 2 }],
        2,
        "Test notes",
        createHourMinute("12:00"),
      );

      // Verify reservation was created first
      expect(apiClient.post).toHaveBeenNthCalledWith(
        1,
        "/reservations",
        expect.objectContaining({
          zzz_service_at: expect.any(String),
          zzz_time_of_day: "LUNCH",
          zzz_guest_count: 2,
        }),
      );

      // Verify services were fetched to find the catalog type
      expect(apiClient.get).toHaveBeenCalledWith("/services");

      // Verify order was created with reservation ID
      expect(apiClient.post).toHaveBeenNthCalledWith(
        2,
        "/orders",
        expect.objectContaining({
          zzz_reservation_id: "res-uuid-123",
          zzz_catalog_type_id: 1,
          zzz_notes: "Test notes",
        }),
      );

      expect(result).toEqual(mockOrder);
    });

    it("should rollback reservation when order creation fails", async () => {
      const date = new Date("2026-05-24T12:00:00Z");
      const mockReservation = { zzz_id: "res-uuid-rollback" };
      const mockServices = [
        {
          zzz_id: 1,
          zzz_product_category_id: 1,
          zzz_price: 1500,
          zzz_name_i18n: { en: "Test" },
          zzz_image_url: null,
          zzz_description_i18n: { en: "Test" },
          zzz_max_participants: 10,
          zzz_global_pause: false,
          zzz_service_moments: ["LUNCH"],
        },
      ];

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce(mockReservation)
        .mockRejectedValueOnce(new Error("Order creation failed"));
      (apiClient.get as jest.Mock).mockResolvedValue(mockServices);

      await expect(
        ProductService.placeOrder(date, "LUNCH", [{ zzz_catalog_item_id: 1, zzz_quantity: 2 }], 2),
      ).rejects.toThrow("Order creation failed");

      // Verify rollback: cancelled the reservation
      expect(apiClient.patch).toHaveBeenCalledWith("/reservations/res-uuid-rollback", {
        zzz_status: "CANCELLED",
      });
    });
  });
});
