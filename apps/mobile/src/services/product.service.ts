/**
 * Product Service — tourist products/catalog.
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem + Order types aligned with OpenSpec entities.
 * placeOrder() builds an Order directly — there is no intermediate Reservation entity in the DB yet.
 */

import { z } from "zod";

import type { Order, Reservation, ServiceMoment, HourMinute } from "@repo/shared";
import { ServiceMomentSchema, MOCK_VENTURE_WITH_ORDERS } from "@repo/shared";
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
import { mapNetworkError } from "./api-utils";
import { resolveImageUrl } from "./image-assets";
import { apiClient } from "./api-client";

const MOCK_DELAYS = { FAST: 500, NORMAL: 600, SLOW: 800 } as const;
const MAX_ORDER_QUANTITY = 20;
const UUID_PAD_LENGTH = 12;
const MOCK_ID_RANGE = 100000;

// Re-export for convenience
export type { ProductItem };

// Validation schemas for booking operations
export const BookingInputSchema = z.object({
  serviceId: z.number(),
  moment: ServiceMomentSchema,
  zzz_quantity: z.number().min(1).max(MAX_ORDER_QUANTITY),
  date: z.date(),
  zzz_notes: z.string().optional(),
});

type BookingInput = z.infer<typeof BookingInputSchema>;

/**
 * Common interface for product service implementations
 */
const mockId = (n: number): string =>
  `00000000-0000-0000-0000-${String(n).padStart(UUID_PAD_LENGTH, "0")}`;

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
  updateOrder(id: string, input: Partial<BookingInput>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  getOrders(userId?: string): Promise<Order[]>;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
const mockProducts = [...MOCK_PRODUCTS];

const MockProductService: ProductServiceInterface = {
  getServices: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.SLOW));
    return [...mockProducts];
  },

  getServiceById: async (id: number) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.FAST));
    return mockProducts.find((s) => s.zzz_id === id) || null;
  },

  getServicesByCategory: async (categoryId: number) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.NORMAL));
    return mockProducts.filter((s) => s.zzz_product_category_id === categoryId);
  },

  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number; zzz_notes?: string }>,
    guestCount: number,
    notes?: string,
    time?: HourMinute,
  ) => {
    // Require user to be logged in
    if (!isMockUserLoggedIn()) {
      throw new Error("User must be logged in to place an order");
    }

    await new Promise((r) => setTimeout(r, MOCK_DELAYS.SLOW));

    if (items.length === 0) {
      throw new Error("Cannot place an order without items");
    }

    // Use the first item's category as the order's primary category (MVP constraint)
    const firstService = mockProducts.find((s) => s.zzz_id === items[0].zzz_catalog_item_id);
    if (!firstService) throw new Error("Service not found");

    const orderId = mockId(Date.now());
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
      zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
      zzz_notes: notes ?? null,
      zzz_global_status: "OFFER_PENDING",
      zzz_cancel_reason: null,
      zzz_items: items.map((item) => {
        const s = mockProducts.find((service) => service.zzz_id === item.zzz_catalog_item_id);
        return {
          zzz_id: mockId(Math.floor(Math.random() * MOCK_ID_RANGE)),
          zzz_order_id: orderId,
          zzz_catalog_item_id: item.zzz_catalog_item_id,
          zzz_quantity: item.zzz_quantity,
          zzz_price: s?.zzz_price || 0,
          zzz_notes: item.zzz_notes ?? undefined,
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

  updateOrder: async (id: string, input: Partial<BookingInput>) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.NORMAL));

    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => o.zzz_id === id);
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
      const foundOrder = getMockOrderById(id);
      if (foundOrder?.zzz_reservation_id) {
        // This is a bit of a shortcut for the mock, updating the reservation in state
        const reservationUpdates: Partial<Reservation> = {};
        if (input.date) reservationUpdates.zzz_service_at = input.date.toISOString();
        if (input.moment) reservationUpdates.zzz_time_of_day = input.moment;

        updateMockReservation(foundOrder.zzz_reservation_id, reservationUpdates);
      }
    }

    updateMockOrder(id, updates);
    return { ...order, ...updates };
  },

  updateOrderStatus: async (id: string, status: string) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.NORMAL));
    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => o.zzz_id === id);
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = { zzz_global_status: status as Order["zzz_global_status"] };
    if (status === "CONFIRMED") {
      updates.zzz_confirmed_at = new Date();
    }

    updateMockOrder(id, updates);
    return { ...order, ...updates };
  },

  getOrders: async (userId?: string) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAYS.FAST));
    return getMockOrders(userId);
  },
};

/**
 * 📡 REST API Implementation (Future)
 */
const mapImage = (item: ProductItem): ProductItem => ({
  ...item,
  zzz_image_url: resolveImageUrl(item.zzz_image_url) as ProductItem["zzz_image_url"],
});

const RestProductService: ProductServiceInterface = {
  getServices: async () => {
    try {
      const items = await apiClient.get<ProductItem[]>("/services");
      return items.map(mapImage);
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getServiceById: async (id: number) => {
    try {
      const item = await apiClient.get<ProductItem | null>(`/services/${id}`);
      return item ? mapImage(item) : null;
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getServicesByCategory: async (categoryId: number) => {
    try {
      const items = await apiClient.get<ProductItem[]>(`/services?category_id=${categoryId}`);
      return items.map(mapImage);
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number; zzz_notes?: string }>,
    guestCount: number,
    notes?: string,
    time?: HourMinute,
  ) => {
    try {
      const serviceAt = time ? combineDateAndTime(date, time) : date.toISOString();
      const reservation = await apiClient.post<{ zzz_id: string }>("/reservations", {
        zzz_service_at: serviceAt,
        zzz_time_of_day: moment,
        zzz_guest_count: guestCount,
      });

      // Fetch services to find the catalog type from the first item
      const services = await apiClient.get<ProductItem[]>("/services");
      const firstService = services.find((s) => s.zzz_id === items[0]?.zzz_catalog_item_id);
      if (!firstService) throw new Error("Service not found for order");

      try {
        const newOrder = await apiClient.post<Order>("/orders", {
          zzz_reservation_id: reservation.zzz_id,
          zzz_catalog_type_id: firstService.zzz_product_category_id,
          zzz_notes: notes || undefined,
          zzz_items: items.map((i) => ({
            zzz_catalog_item_id: i.zzz_catalog_item_id,
            zzz_quantity: i.zzz_quantity,
            zzz_notes: i.zzz_notes,
          })),
        });
        return newOrder;
      } catch (err) {
        // Rollback: cancel the reservation
        logger.error("Order creation failed, rolling back reservation", err);
        await apiClient.patch(`/reservations/${reservation.zzz_id}`, {
          zzz_status: "CANCELLED",
        });
        throw err;
      }
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  updateOrder: async (id: string, input: Partial<BookingInput>) => {
    try {
      return await apiClient.patch<Order>(`/orders/${id}`, { zzz_notes: input.zzz_notes });
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      return await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getOrders: async (userId?: string) => {
    try {
      const path = userId ? `/orders?userId=${userId}` : "/orders";
      return await apiClient.get<Order[]>(path);
    } catch (error) {
      throw mapNetworkError(error);
    }
  },
};

/**
 * EXPORT: The smart switch
 */
export const ProductService = env.USE_MOCKS ? MockProductService : RestProductService;
