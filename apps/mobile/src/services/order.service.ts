/**
 * Order Service - Tourist Orders
 * Follows the mock + REST switch pattern from catalog.service.ts
 *
 * Uses @repo/shared Order type aligned with OpenSpec Order entity
 */

import type { Order, OrderStatus } from "@repo/shared";
import { logger } from "./logger.service";
import env from "../config/env";
import { MOCK_ORDERS } from "../mocks/orders";

/**
 * Common interface for order service implementations
 */
export interface OrderServiceInterface {
  getOrders(status?: OrderStatus): Promise<Order[]>;
  cancelOrder(id: number): Promise<void>;
}

/**
 * MOCK Implementation
 */
const MockOrderService: OrderServiceInterface = {
  getOrders: async (status?: OrderStatus) => {
    await new Promise((r) => setTimeout(r, 600));
    if (status) {
      return MOCK_ORDERS.filter((o) => o.global_status === status);
    }
    return [...MOCK_ORDERS];
  },

  cancelOrder: async (id: number) => {
    await new Promise((r) => setTimeout(r, 500));
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.global_status === "SEARCHING") {
      order.global_status = "CANCELLED";
      order.cancel_reason = "BY_TOURIST";
      order.cancelled_at = new Date();
    } else {
      throw new Error("Only SEARCHING orders can be cancelled");
    }
  },
};

/**
 * REST Implementation (for production)
 */
const RestOrderService: OrderServiceInterface = {
  getOrders: async (status?: OrderStatus) => {
    try {
      const params = status ? `?status=${status}` : "";
      const res = await fetch(`${env.API_URL}/orders${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      logger.error("OrderService.getOrders", error);
      throw error;
    }
  },

  cancelOrder: async (id: number) => {
    try {
      const res = await fetch(`${env.API_URL}/orders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to cancel order: ${res.status}`);
      }
    } catch (error) {
      logger.error("OrderService.cancelOrder", error);
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
