/**
 * Order Service - Tourist Orders
 * Follows the mock + REST switch pattern from catalog.service.ts
 *
 * Uses @repo/shared Order type aligned with OpenSpec Order entity
 */

import type {
  Order,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderInput,
  OrderItem,
} from "@repo/shared";
import { logger } from "./logger.service";
import env from "../config/env";
import { getMockOrders, addMockOrder, updateMockOrder } from "../mocks/orders";
import { apiClient } from "./api-client";

const MOCK_DELAYS = { FAST: 500, NORMAL: 600, SLOW: 800, INSTANT: 300 } as const;
const UUID_PAD_LENGTH = 12;
const MOCK_ID_RANGE = 100000;

/**
 * Common interface for order service implementations
 */
export interface OrderServiceInterface {
  getOrders(status?: OrderStatus): Promise<Order[]>;
  cancelOrder(id: string): Promise<void>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  updateOrder(id: string, input: UpdateOrderInput): Promise<Order>;
}

/**
 * MOCK Implementation
 */
const MockOrderService: OrderServiceInterface = {
  getOrders: async (status?: OrderStatus) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.NORMAL));
    const orders = getMockOrders();
    if (status) {
      return orders.filter((o) => o.zzz_global_status === status);
    }
    return orders;
  },

  cancelOrder: async (id: string) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.FAST));
    const orders = getMockOrders();
    const order = orders.find((o) => o.zzz_id === id);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.zzz_global_status === "SEARCHING") {
      order.zzz_global_status = "CANCELLED";
      order.zzz_cancel_reason = "BY_TOURIST";
      order.zzz_cancelled_at = new Date();
    } else {
      throw new Error("Only SEARCHING orders can be cancelled");
    }
  },

  createOrder: async (input: CreateOrderInput) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.INSTANT));
    const orderId = `00000000-0000-0000-0000-${String(Date.now()).padStart(UUID_PAD_LENGTH, "0")}`;
    const newOrder: Omit<Order, "zzz_id"> = {
      zzz_reservation_id: input.zzz_reservation_id,
      zzz_product_category_id: input.zzz_product_category_id,
      zzz_notes: input.zzz_notes ?? null,
      zzz_notify_whatsapp: input.zzz_notify_whatsapp ?? false,
      zzz_global_status: "SEARCHING",
      zzz_confirmed_venture_id: null,
      zzz_current_offer_venture_id: null,
      zzz_cancel_reason: null,
      zzz_items: (input.zzz_items || []).map(
        (item): OrderItem => ({
          zzz_id: `00000000-0000-0000-0000-${String(Math.floor(Math.random() * MOCK_ID_RANGE)).padStart(UUID_PAD_LENGTH, "0")}`,
          zzz_order_id: orderId,
          zzz_catalog_item_id: item.zzz_catalog_item_id,
          zzz_quantity: item.zzz_quantity,
          zzz_price: 0,
          zzz_notes: item.zzz_notes,
        }),
      ),
      zzz_cancelled_at: null,
      zzz_completed_at: null,
      zzz_confirmed_at: null,
      zzz_created_at: new Date(),
    };
    const created = addMockOrder(newOrder);
    logger.info("[MOCK API] Order created via MockOrderService", { zzz_id: created.zzz_id });
    return created;
  },

  updateOrder: async (id: string, input: UpdateOrderInput) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.INSTANT));
    updateMockOrder(id, {
      zzz_notes: input.zzz_notes ?? null,
      zzz_notify_whatsapp: input.zzz_notify_whatsapp,
    });
    const updated = getMockOrders().find((o) => o.zzz_id === id);
    if (!updated) throw new Error("Order not found");
    logger.info("[MOCK API] Order updated via MockOrderService", { zzz_id: id });
    return updated;
  },
};

/**
 * REST Implementation (for production)
 */
const RestOrderService: OrderServiceInterface = {
  getOrders: async (status?: OrderStatus) => {
    try {
      const path = status ? `/orders?status=${status}` : "/orders";
      return await apiClient.get<Order[]>(path);
    } catch (error) {
      logger.error("OrderService.getOrders", error);
      throw error;
    }
  },

  cancelOrder: async (id: string) => {
    try {
      await apiClient.patch(`/orders/${id}`, {
        status: "CANCELLED",
        cancel_reason: "BY_TOURIST",
      });
    } catch (error) {
      logger.error("OrderService.cancelOrder", error);
      throw error;
    }
  },

  createOrder: async (input: CreateOrderInput) => {
    try {
      return await apiClient.post<Order>("/orders", input);
    } catch (error) {
      logger.error("OrderService.createOrder", error);
      throw error;
    }
  },

  updateOrder: async (id: string, input: UpdateOrderInput) => {
    try {
      return await apiClient.patch<Order>(`/orders/${id}`, input);
    } catch (error) {
      logger.error("OrderService.updateOrder", error);
      throw error;
    }
  },
};

/**
 * Export the appropriate service based on environment
 */
export const orderService: OrderServiceInterface = env.USE_MOCKS
  ? MockOrderService
  : RestOrderService;
