/**
 * Mock data for tourist orders
 * Shared between catalog and order services during development
 */

import { Order } from "@repo/shared";
import {
  EMPANADAS_CARNE_DOCENA,
  ASADO_POLLO,
  EMPANADAS_VERDURA_DOCENA,
  DESAYUNO,
  MERIENDA,
} from "./catalog";
import { getMockUserId, getDefaultMockUserId } from "./users";
import { mockGetCurrentUser } from "../services/auth.service";
import { logger } from "../services/logger.service";

// Default user ID for demo orders (read once at module load)
const DEFAULT_USER_ID = getDefaultMockUserId();

// Helper to get a date relative to today
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

// Dates for mocks
const today = daysFromNow(0);
const tomorrow = daysFromNow(1);
const dayAfterTomorrow = daysFromNow(2);
const yesterday = daysFromNow(-1);

// Initial set of mock orders - shows demo data when no user is logged in
const DEFAULT_MOCK_ORDERS: Order[] = [
  {
    id: 1,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: DESAYUNO.id,
    catalog_item: DESAYUNO,
    quantity: 1,
    price_at_purchase: 2500,
    confirmed_venture_id: null,
    service_date: today,
    time_of_day: "BREAKFAST",
    guest_count: 2,
    notes: "Sin azucar",
    global_status: "SEARCHING",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: null,
    created_at: today,
    notify_whatsapp: true,
  },
  {
    id: 2,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: ASADO_POLLO.id,
    catalog_item: ASADO_POLLO,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: today,
    time_of_day: "LUNCH",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: new Date("2026-04-11T14:30:00Z"),
    created_at: new Date("2026-04-09T09:00:00Z"),
    notify_whatsapp: false,
  },
  {
    id: 3,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: MERIENDA.id,
    catalog_item: MERIENDA,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: tomorrow,
    time_of_day: "SNACK",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: tomorrow,
    created_at: tomorrow,
    notify_whatsapp: false,
  },
  {
    id: 4,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: ASADO_POLLO.id,
    catalog_item: ASADO_POLLO,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: dayAfterTomorrow,
    time_of_day: "DINNER",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: dayAfterTomorrow,
    created_at: dayAfterTomorrow,
    notify_whatsapp: false,
  },
  {
    id: 5,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: EMPANADAS_CARNE_DOCENA.id,
    catalog_item: EMPANADAS_CARNE_DOCENA,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: yesterday,
    time_of_day: "DINNER",
    guest_count: 3,
    notes: null,
    global_status: "COMPLETED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: new Date("2026-04-05T21:00:00Z"),
    confirmed_at: new Date("2026-04-04T10:00:00Z"),
    created_at: new Date("2026-04-02T15:00:00Z"),
    notify_whatsapp: true,
  },
  {
    id: 6,
    user_id: DEFAULT_USER_ID,
    catalog_item_id: EMPANADAS_VERDURA_DOCENA.id,
    catalog_item: EMPANADAS_VERDURA_DOCENA,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: today,
    time_of_day: "DINNER",
    guest_count: 3,
    notes: null,
    global_status: "EXPIRED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: null,
    created_at: new Date("2026-04-02T15:00:00Z"),
    notify_whatsapp: true,
  },
];

// Store for dynamic orders (created at runtime) - wrapped in object to avoid let
const ordersState = {
  orders: [] as Order[],
};

/**
 * Get all mock orders for the current user
 * - If no user logged in: returns empty array
 * - If logged in: returns orders matching user's ID (demo + dynamic)
 */
export function getMockOrders(): Order[] {
  const currentUser = mockGetCurrentUser();

  // If no user is logged in, return empty
  if (!currentUser) {
    return [];
  }

  // If user is logged in, return orders that match their ID (both demo and dynamic)
  const allOrders = [...DEFAULT_MOCK_ORDERS, ...ordersState.orders];
  return allOrders.filter((order) => order.user_id === currentUser.id);
}

// Legacy export for backwards compatibility - DO NOT use in new code
export const MOCK_ORDERS: Order[] = [];

/**
 * Helper to add an order to the mock collection
 * Automatically uses the current logged-in user's ID
 */
export function addMockOrder(order: Omit<Order, "id" | "user_id">) {
  const newOrder: Order = {
    id: Date.now(),
    user_id: getMockUserId(),
    ...order,
  };
  ordersState.orders = [newOrder, ...ordersState.orders];
  logger.info("[MOCK] Added order:", newOrder as unknown as Record<string, unknown>);
}

/**
 * Helper to update an order status
 */
export function updateMockOrderStatus(id: number, status: Order["global_status"]) {
  const order = ordersState.orders.find((o) => o.id === id);
  if (order) {
    order.global_status = status;
  }
}
