import { Order, Reservation } from "@repo/shared";
import { ASADO_POLLO, EMPANADAS_VERDURA_DOCENA, SERVICE_CATEGORY_IDS } from "./catalog";
import { MOCK_USER_TOURIST_WITH_ORDERS } from "./users.data";

// Helper for dates relative to today
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const today = daysFromNow(0);
const yesterday = daysFromNow(-1);

export const MARIA_VENTURE_ID = 1;

/**
 * Mock Reservations
 */
export const INITIAL_MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
    service_date: today,
    time_of_day: "LUNCH",
    status: "PENDING",
  },
  {
    id: 2,
    user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
    service_date: today,
    time_of_day: "DINNER",
    status: "CONFIRMED",
  },
];

/**
 * Pure mock data for orders to be used in different services/stores
 */
export const INITIAL_MOCK_ORDERS: Order[] = [
  // --- Reservation 1 (Lunch Today) ---
  {
    id: 1,
    user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
    reservation_id: 1,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "SEARCHING",
    service_date: today,
    time_of_day: "LUNCH",
    notes: "Please no spicy",
    items: [
      {
        id: 1,
        order_id: 1,
        catalog_item_id: EMPANADAS_VERDURA_DOCENA.id,
        quantity: 1,
        price: EMPANADAS_VERDURA_DOCENA.price,
      },
      {
        id: 2,
        order_id: 1,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 2,
        price: ASADO_POLLO.price,
      },
    ],
    created_at: today,
    notify_whatsapp: true,
    confirmed_venture_id: MARIA_VENTURE_ID,
  },
  // --- Reservation 2 (Dinner Today) ---
  {
    id: 2,
    user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
    reservation_id: 2,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MARIA_VENTURE_ID,
    service_date: today,
    time_of_day: "DINNER",
    items: [
      {
        id: 3,
        order_id: 2,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 1,
        price: 4501,
      },
    ],
    created_at: yesterday,
    confirmed_at: today,
    notify_whatsapp: false,
  },
  // --- Reservation 3 (Breakfast Today) ---
  {
    id: 3,
    user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
    reservation_id: 3,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CANCELLED",
    confirmed_venture_id: MARIA_VENTURE_ID,
    service_date: today,
    time_of_day: "BREAKFAST",
    items: [
      {
        id: 3,
        order_id: 3,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 1,
        price: 4501,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
];
