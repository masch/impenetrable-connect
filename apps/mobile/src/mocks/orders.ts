/**
 * Mock data for tourist orders
 * Shared between catalog and order services during development
 */

import { Order } from "@repo/shared";
import {
  MOCK_CATALOG_FORST_STEW,
  MOCK_CATALOG_REGIONAL_GRILL,
  MOCK_CATALOG_RIVER_EXCURSION,
} from "./catalog";

// Initial set of mock orders
export let MOCK_ORDERS: Order[] = [
  {
    id: 1,
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    catalog_item_id: MOCK_CATALOG_FORST_STEW.id,
    catalog_item: MOCK_CATALOG_FORST_STEW,
    quantity: 1,
    price_at_purchase: 2500,
    confirmed_venture_id: null,
    service_date: new Date("2026-04-13"),
    time_of_day: "LUNCH",
    guest_count: 2,
    notes: "Sin picante por favor",
    global_status: "SEARCHING",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: null,
    created_at: new Date("2026-04-10T10:00:00Z"),
    notify_whatsapp: true,
  },
  {
    id: 2,
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    catalog_item_id: MOCK_CATALOG_RIVER_EXCURSION.id,
    catalog_item: MOCK_CATALOG_RIVER_EXCURSION,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: new Date("2026-04-12"),
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
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    catalog_item_id: MOCK_CATALOG_REGIONAL_GRILL.id,
    catalog_item: MOCK_CATALOG_REGIONAL_GRILL,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: new Date("2026-04-05"),
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
    id: 4,
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    catalog_item_id: MOCK_CATALOG_REGIONAL_GRILL.id,
    catalog_item: MOCK_CATALOG_REGIONAL_GRILL,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: new Date("2026-04-04"),
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

/**
 * Helper to add an order to the mock collection
 */
export function addMockOrder(order: Omit<Order, "id">) {
  const newOrder: Order = {
    id: Date.now(),
    ...order,
  };
  MOCK_ORDERS = [newOrder, ...MOCK_ORDERS];
}

/**
 * Helper to update an order status
 */
export function updateMockOrderStatus(id: number, status: Order["global_status"]) {
  // No global counter needed, use Date.now() locally
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (order) {
    order.global_status = status;
  }
}
