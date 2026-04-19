import { Order, Reservation } from "@repo/shared";
import {
  ASADO_POLLO,
  EMPANADAS_VERDURA_DOCENA,
  POSTRE_REGIONAL,
  REPOLLO_ASADO,
  SERVICE_CATEGORY_IDS,
} from "./catalog";
import { MOCK_USER_TOURIST_WITH_ORDERS } from "./users.data";
import { MOCK_VENTURE_WITH_ORDERS } from "./ventures.data";

// Helper for dates relative to today
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const today = daysFromNow(0);
const tomorrow = daysFromNow(1);

const MOCK_RESERVATION_TODAY_LUNCH_CREATED: Reservation = {
  id: 1,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "LUNCH",
  status: "CREATED",
};

const MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING: Reservation = {
  id: 2,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "BREAKFAST",
  status: "SEARCHING",
};

const MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED: Reservation = {
  id: 3,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: tomorrow,
  time_of_day: "DINNER",
  status: "CONFIRMED",
};

const MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED: Reservation = {
  id: 4,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: tomorrow,
  time_of_day: "BREAKFAST",
  status: "CANCELLED",
};

const MOCK_RESERVATION_TODAY_LUNCH_CANCELLED: Reservation = {
  id: 5,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "LUNCH",
  status: "CANCELLED",
};

const MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED: Reservation = {
  id: 6,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: tomorrow,
  time_of_day: "DINNER",
  status: "CANCELLED",
};

const MOCK_RESERVATION_TODAY_SNACK_CONFIRMED: Reservation = {
  id: 7,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "SNACK",
  status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2: Reservation = {
  id: 8,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "DINNER",
  status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3: Reservation = {
  id: 9,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "DINNER",
  status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4: Reservation = {
  id: 10,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "DINNER",
  status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5: Reservation = {
  id: 11,
  user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  service_date: today,
  time_of_day: "DINNER",
  status: "CONFIRMED",
};

/**
 * Reservations (parent entities for orders)
 */
export const MOCK_RESERVATIONS: Reservation[] = [
  MOCK_RESERVATION_TODAY_LUNCH_CREATED,
  MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING,
  MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED,
  MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED,
  MOCK_RESERVATION_TODAY_LUNCH_CANCELLED,
  MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED,
  MOCK_RESERVATION_TODAY_SNACK_CONFIRMED,
  MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2,
  MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3,
  MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4,
  MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5,
];

/**
 * Pure mock data for orders to be used in different services/stores
 */
export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 1,
    reservation_id: MOCK_RESERVATION_TODAY_LUNCH_CREATED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "SEARCHING",
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
    confirmed_venture_id: null,
  },
  {
    id: 2,
    reservation_id: MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "OFFER_PENDING",
    confirmed_venture_id: null,
    current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 3,
        order_id: 2,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 1,
        price: 4501,
      },
      {
        id: 4,
        order_id: 2,
        catalog_item_id: REPOLLO_ASADO.id,
        quantity: 3,
        price: REPOLLO_ASADO.price,
      },
    ],
    created_at: tomorrow,
    confirmed_at: null,
    notify_whatsapp: false,
  },
  {
    id: 3,
    reservation_id: MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 5,
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
  {
    id: 4,
    reservation_id: MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CANCELLED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 6,
        order_id: 4,
        catalog_item_id: POSTRE_REGIONAL.id,
        quantity: 3,
        price: POSTRE_REGIONAL.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 5,
    reservation_id: MOCK_RESERVATION_TODAY_LUNCH_CANCELLED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CANCELLED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 7,
        order_id: 5,
        catalog_item_id: EMPANADAS_VERDURA_DOCENA.id,
        quantity: 2,
        price: EMPANADAS_VERDURA_DOCENA.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 6,
    reservation_id: MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CANCELLED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 8,
        order_id: 6,
        catalog_item_id: REPOLLO_ASADO.id,
        quantity: 1,
        price: REPOLLO_ASADO.price,
      },
      {
        id: 9,
        order_id: 6,
        catalog_item_id: POSTRE_REGIONAL.id,
        quantity: 1,
        price: POSTRE_REGIONAL.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 7,
    reservation_id: MOCK_RESERVATION_TODAY_SNACK_CONFIRMED.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 10,
        order_id: 7,
        catalog_item_id: POSTRE_REGIONAL.id,
        quantity: 2,
        price: POSTRE_REGIONAL.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 8,
    reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 11,
        order_id: 8,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 1,
        price: ASADO_POLLO.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 9,
    reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 12,
        order_id: 9,
        catalog_item_id: EMPANADAS_VERDURA_DOCENA.id,
        quantity: 1,
        price: EMPANADAS_VERDURA_DOCENA.price,
      },
      {
        id: 16,
        order_id: 9,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 1,
        price: ASADO_POLLO.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 10,
    reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 13,
        order_id: 10,
        catalog_item_id: ASADO_POLLO.id,
        quantity: 2,
        price: ASADO_POLLO.price,
      },
      {
        id: 17,
        order_id: 10,
        catalog_item_id: POSTRE_REGIONAL.id,
        quantity: 1,
        price: POSTRE_REGIONAL.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
  {
    id: 11,
    reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5.id,
    catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    global_status: "CONFIRMED",
    confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    items: [
      {
        id: 14,
        order_id: 11,
        catalog_item_id: REPOLLO_ASADO.id,
        quantity: 1,
        price: REPOLLO_ASADO.price,
      },
      {
        id: 15,
        order_id: 11,
        catalog_item_id: POSTRE_REGIONAL.id,
        quantity: 2,
        price: POSTRE_REGIONAL.price,
      },
    ],
    notify_whatsapp: false,
    created_at: today,
    confirmed_at: today,
  },
];
