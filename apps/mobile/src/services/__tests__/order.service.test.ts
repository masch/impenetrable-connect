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

import { orderService } from "../order.service";

describe("RestOrderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrders", () => {
    it("should call apiClient.get with /orders when no status filter", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);
      await orderService.getOrders();
      expect(apiClient.get).toHaveBeenCalledWith("/orders");
    });

    it("should append ?status= filter when status is provided", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);
      await orderService.getOrders("CANCELLED");
      expect(apiClient.get).toHaveBeenCalledWith("/orders?status=CANCELLED");
    });
  });

  describe("cancelOrder", () => {
    it("should call apiClient.patch with cancel body", async () => {
      (apiClient.patch as jest.Mock).mockResolvedValue(undefined);
      await orderService.cancelOrder("order-123");
      expect(apiClient.patch).toHaveBeenCalledWith("/orders/order-123", {
        status: "CANCELLED",
        cancel_reason: "BY_TOURIST",
      });
    });
  });

  describe("createOrder", () => {
    it("should call apiClient.post with the input body", async () => {
      const input = {
        zzz_reservation_id: "res-1",
        zzz_catalog_type_id: 2,
        zzz_notify_whatsapp: false,
        zzz_items: [{ zzz_catalog_item_id: 5, zzz_quantity: 2 }],
      };
      const expectedOrder = { zzz_id: "order-new", ...input };
      (apiClient.post as jest.Mock).mockResolvedValue(expectedOrder);

      const result = await orderService.createOrder(input);

      expect(apiClient.post).toHaveBeenCalledWith("/orders", input);
      expect(result).toEqual(expectedOrder);
    });
  });

  describe("updateOrder", () => {
    it("should call apiClient.patch with id and body", async () => {
      const input = { zzz_notes: "Updated notes" };
      const expected = { zzz_id: "order-1", zzz_notes: "Updated notes" };
      (apiClient.patch as jest.Mock).mockResolvedValue(expected);

      const result = await orderService.updateOrder("order-1", input);

      expect(apiClient.patch).toHaveBeenCalledWith("/orders/order-1", input);
      expect(result).toEqual(expected);
    });
  });
});
