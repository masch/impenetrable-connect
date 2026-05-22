/**
 * Product Service — tourist products/catalog.
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem + Order types aligned with OpenSpec entities.
 * placeOrder() builds an Order directly — there is no intermediate Reservation entity in the DB yet.
 */

import { z } from "zod";

import type { Order, Reservation, ServiceMoment, HourMinute } from "@repo/shared";
import { ServiceMomentSchema } from "@repo/shared";
import { combineDateAndTime } from "../logic/formatters";
import { MOCK_PRODUCTS, type ProductItem } from "../mocks/product";
import {
  addMockOrder,
  addMockReservation,
  getMockOrders,
  updateMockOrder,
  updateMockReservation,
} from "../mocks/orders";
import { isMockUserLoggedIn, getMockUserId } from "../mocks/users";

import { logger } from "./logger.service";
import env from "../config/env";
import { mapNetworkError, handleResponse } from "./api-utils";

// Re-export for convenience
export type { ProductItem };

// Validation schemas for booking operations
export const BookingInputSchema = z.object({
  serviceId: z.number(),
  moment: ServiceMomentSchema,
  zzz_quantity: z.number().min(1).max(20),
  date: z.date(),
  zzz_notes: z.string().optional(),
});

type BookingInput = z.infer<typeof BookingInputSchema>;

/**
 * Common interface for product service implementations
 */
export interface ProductServiceInterface {
  getServices(): Promise<ProductItem[]>;
  getServiceById(id: number): Promise<ProductItem | null>;
  getServicesByCategory(categoryId: number): Promise<ProductItem[]>;
  placeOrder(
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number }>,
    guestCount: number,
    notes?: string,
    time?: HourMinute,
  ): Promise<Order>;
  updateOrder(id: number, input: Partial<BookingInput>): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrders(userId?: string): Promise<Order[]>;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
const mockProducts = [...MOCK_PRODUCTS];

const MockProductService: ProductServiceInterface = {
  getServices: async () => {
    await new Promise((r) => setTimeout(r, 800));
    return [...mockProducts];
  },

  getServiceById: async (id: number) => {
    await new Promise((r) => setTimeout(r, 500));
    return mockProducts.find((s) => s.zzz_id === id) || null;
  },

  getServicesByCategory: async (categoryId: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return mockProducts.filter((s) => s.zzz_product_category_id === categoryId);
  },

  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number }>,
    guestCount: number,
    notes?: string,
    time?: HourMinute,
  ) => {
    // Require user to be logged in
    if (!isMockUserLoggedIn()) {
      throw new Error("User must be logged in to place an order");
    }

    await new Promise((r) => setTimeout(r, 800));

    if (items.length === 0) {
      throw new Error("Cannot place an order without items");
    }

    // Use the first item's category as the order's primary category (MVP constraint)
    const firstService = mockProducts.find((s) => s.zzz_id === items[0].zzz_catalog_item_id);
    if (!firstService) throw new Error("Service not found");

    const orderId = Date.now();
    const serviceAt = time ? combineDateAndTime(date, time) : date.toISOString();
    const reservation = addMockReservation({
      zzz_user_id: isMockUserLoggedIn() ? getMockUserId() : "unknown",
      zzz_service_at: serviceAt,
      zzz_time_of_day: moment,
      zzz_status: "CREATED",
      zzz_guest_count: guestCount,
      zzz_created_at: new Date(),
    });

    const newOrder: Order = {
      zzz_id: orderId,
      zzz_reservation_id: reservation.zzz_id,
      zzz_catalog_type_id: firstService.zzz_product_category_id,
      zzz_confirmed_venture_id: null,
      zzz_notes: notes ?? null,
      zzz_global_status: "SEARCHING",
      zzz_cancel_reason: null,
      zzz_items: items.map((item) => {
        const s = mockProducts.find((service) => service.zzz_id === item.zzz_catalog_item_id);
        return {
          zzz_id: Math.floor(Math.random() * 100000),
          zzz_order_id: orderId,
          zzz_catalog_item_id: item.zzz_catalog_item_id,
          zzz_quantity: item.zzz_quantity,
          zzz_price: s?.zzz_price || 0,
        };
      }),
      zzz_cancelled_at: null,
      zzz_completed_at: null,
      zzz_confirmed_at: null,
      zzz_created_at: new Date(),
      zzz_notify_whatsapp: false,
    };

    addMockOrder(newOrder);
    logger.info(
      "[MOCK API] Placed multi-item order:",
      newOrder as unknown as Record<string, unknown>,
    );
    return newOrder;
  },

  updateOrder: async (id: number, input: Partial<BookingInput>) => {
    await new Promise((r) => setTimeout(r, 600));

    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => Number(o.zzz_id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = {};
    if (input.zzz_quantity) {
      // Update quantity in items (assuming single item for now in mock)
      if (order.zzz_items && order.zzz_items.length > 0) {
        updates.zzz_items = order.zzz_items.map((item) => ({
          ...item,
          zzz_quantity: input.zzz_quantity!,
        }));
      }
    }
    if (input.zzz_notes !== undefined) {
      updates.zzz_notes = input.zzz_notes;
    }
    if (input.date || input.moment) {
      // In a real system, we might move the order to a different reservation
      // or update the existing one. For mocks, we'll handle this by updating the reservation.
      const { getMockOrderById } = await import("../mocks/orders");
      const foundOrder = getMockOrderById(Number(id));
      if (foundOrder?.zzz_reservation_id) {
        // This is a bit of a shortcut for the mock, updating the reservation in state
        const reservationUpdates: Partial<Reservation> = {};
        if (input.date) reservationUpdates.zzz_service_at = input.date.toISOString();
        if (input.moment) reservationUpdates.zzz_time_of_day = input.moment;

        updateMockReservation(foundOrder.zzz_reservation_id, reservationUpdates);
      }
    }

    updateMockOrder(Number(id), updates);
    return { ...order, ...updates };
  },

  updateOrderStatus: async (id: number, status: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => Number(o.zzz_id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = { zzz_global_status: status as Order["zzz_global_status"] };
    if (status === "CONFIRMED") {
      updates.zzz_confirmed_at = new Date();
    }

    updateMockOrder(Number(id), updates);
    return { ...order, ...updates };
  },

  getOrders: async (userId?: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return getMockOrders(userId);
  },
};

/**
 * 📡 REST API Implementation (Future)
 */
const RestProductService: ProductServiceInterface = {
  getServices: async () => {
    try {
      const response = await fetch(`${env.API_URL}/services`);
      return handleResponse<ProductItem[]>(response, "errors.catalog_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getServiceById: async (id: number) => {
    try {
      const response = await fetch(`${env.API_URL}/services/${id}`);
      return handleResponse<ProductItem | null>(response, "errors.no_venture_found");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getServicesByCategory: async (categoryId: number) => {
    try {
      const response = await fetch(`${env.API_URL}/services?category_id=${categoryId}`);
      return handleResponse<ProductItem[]>(response, "errors.catalog_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  placeOrder: async (date, moment, items, guestCount, notes, time) => {
    try {
      const serviceAt = time ? combineDateAndTime(date, time) : date.toISOString();
      const response = await fetch(`${env.API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zzz_reservation_id: 0,
          zzz_guest_count: guestCount,
          zzz_time_of_day: moment,
          zzz_service_at: serviceAt,
          zzz_notes: notes ?? null,
          zzz_items: items,
        }),
      });
      return handleResponse<Order>(response, "errors.reservation_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  updateOrder: async (id: number, input: Partial<BookingInput>) => {
    try {
      const response = await fetch(`${env.API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zzz_notes: input.zzz_notes,
        }),
      });
      return handleResponse<Order>(response, "errors.reservation_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  updateOrderStatus: async (id: number, status: string) => {
    try {
      const response = await fetch(`${env.API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return handleResponse<Order>(response, "errors.reservation_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getOrders: async (userId?: string) => {
    try {
      const url = userId ? `${env.API_URL}/orders?userId=${userId}` : `${env.API_URL}/orders`;
      const response = await fetch(url);
      return handleResponse<Order[]>(response, "errors.catalog_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },
};

/**
 * EXPORT: The smart switch
 */
export const ProductService = env.USE_MOCKS ? MockProductService : RestProductService;
