import {
  Order,
  Reservation,
  MOCK_USER_TOURIST_WITH_ORDERS,
  MOCK_VENTURE_WITH_ORDERS,
} from "@repo/shared";
import {
  ASADO_POLLO,
  EMPANADAS_VERDURA_DOCENA,
  POSTRE_REGIONAL,
  REPOLLO_ASADO,
  SERVICE_CATEGORY_IDS,
} from "./catalog";

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
  zzz_id: 1,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "LUNCH",
  zzz_status: "CREATED",
};

const MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING: Reservation = {
  zzz_id: 2,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "BREAKFAST",
  zzz_status: "SEARCHING",
};

const MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED: Reservation = {
  zzz_id: 3,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: tomorrow,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
};

const MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED: Reservation = {
  zzz_id: 4,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: tomorrow,
  zzz_time_of_day: "BREAKFAST",
  zzz_status: "CANCELLED",
};

const MOCK_RESERVATION_TODAY_LUNCH_CANCELLED: Reservation = {
  zzz_id: 5,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "LUNCH",
  zzz_status: "CANCELLED",
};

const MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED: Reservation = {
  zzz_id: 6,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: tomorrow,
  zzz_time_of_day: "DINNER",
  zzz_status: "CANCELLED",
};

const MOCK_RESERVATION_TODAY_SNACK_CONFIRMED: Reservation = {
  zzz_id: 7,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "SNACK",
  zzz_status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2: Reservation = {
  zzz_id: 8,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3: Reservation = {
  zzz_id: 9,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4: Reservation = {
  zzz_id: 10,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5: Reservation = {
  zzz_id: 11,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_date: today,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
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
    zzz_id: 1,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_LUNCH_CREATED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "SEARCHING",
    zzz_notes: "Please no spicy",
    zzz_items: [
      {
        zzz_id: 1,
        zzz_order_id: 1,
        zzz_catalog_item_id: EMPANADAS_VERDURA_DOCENA.zzz_id,
        zzz_quantity: 1,
        zzz_price: EMPANADAS_VERDURA_DOCENA.zzz_price,
      },
      {
        zzz_id: 2,
        zzz_order_id: 1,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 2,
        zzz_price: ASADO_POLLO.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
    zzz_confirmed_venture_id: null,
  },
  {
    zzz_id: 2,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_confirmed_venture_id: null,
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 3,
        zzz_order_id: 2,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 1,
        zzz_price: 4501,
      },
      {
        zzz_id: 4,
        zzz_order_id: 2,
        zzz_catalog_item_id: REPOLLO_ASADO.zzz_id,
        zzz_quantity: 3,
        zzz_price: REPOLLO_ASADO.zzz_price,
      },
    ],
    zzz_created_at: tomorrow,
    zzz_confirmed_at: null,
    zzz_notify_whatsapp: false,
  },
  {
    zzz_id: 3,
    zzz_reservation_id: MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 5,
        zzz_order_id: 3,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 1,
        zzz_price: 4501,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 4,
    zzz_reservation_id: MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CANCELLED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 6,
        zzz_order_id: 4,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 3,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 5,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_LUNCH_CANCELLED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CANCELLED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 7,
        zzz_order_id: 5,
        zzz_catalog_item_id: EMPANADAS_VERDURA_DOCENA.zzz_id,
        zzz_quantity: 2,
        zzz_price: EMPANADAS_VERDURA_DOCENA.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 6,
    zzz_reservation_id: MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CANCELLED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 8,
        zzz_order_id: 6,
        zzz_catalog_item_id: REPOLLO_ASADO.zzz_id,
        zzz_quantity: 1,
        zzz_price: REPOLLO_ASADO.zzz_price,
      },
      {
        zzz_id: 9,
        zzz_order_id: 6,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 1,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 7,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_SNACK_CONFIRMED.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 10,
        zzz_order_id: 7,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 2,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 8,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 11,
        zzz_order_id: 8,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 1,
        zzz_price: ASADO_POLLO.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 9,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 12,
        zzz_order_id: 9,
        zzz_catalog_item_id: EMPANADAS_VERDURA_DOCENA.zzz_id,
        zzz_quantity: 1,
        zzz_price: EMPANADAS_VERDURA_DOCENA.zzz_price,
      },
      {
        zzz_id: 16,
        zzz_order_id: 9,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 1,
        zzz_price: ASADO_POLLO.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 10,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 13,
        zzz_order_id: 10,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 2,
        zzz_price: ASADO_POLLO.zzz_price,
      },
      {
        zzz_id: 17,
        zzz_order_id: 10,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 1,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
  {
    zzz_id: 11,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5.zzz_id,
    zzz_catalog_type_id: SERVICE_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 14,
        zzz_order_id: 11,
        zzz_catalog_item_id: REPOLLO_ASADO.zzz_id,
        zzz_quantity: 1,
        zzz_price: REPOLLO_ASADO.zzz_price,
      },
      {
        zzz_id: 15,
        zzz_order_id: 11,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 2,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_notify_whatsapp: false,
    zzz_created_at: today,
    zzz_confirmed_at: today,
  },
];
