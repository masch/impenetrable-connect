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
  PRODUCT_CATEGORY_IDS,
} from "./product";

// Current date reference for order timestamps
const today = new Date();

// Helper to generate ISO datetime string with timezone from days offset
const daysFromNow = (days: number, hour: number = 12): string => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + days);
  // Format as ISO with Argentina timezone offset (-03:00)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hourStr = String(hour).padStart(2, "0");
  return `${year}-${month}-${day}T${hourStr}:00:00-03:00`;
};

const todayLunch = daysFromNow(0, 13);
const todayBreakfast = daysFromNow(0, 9);
const todaySnack = daysFromNow(0, 17);
const todayDinner = daysFromNow(0, 20);
const todayDinner2 = daysFromNow(0, 21);
const tomorrowLunch = daysFromNow(1, 13);
const tomorrowLunch2 = daysFromNow(1, 14);
const tomorrowDinner = daysFromNow(1, 20);
const tomorrowBreakfast = daysFromNow(1, 9);
const afterTomorrowBreakfast = daysFromNow(2, 9);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const MOCK_RESERVATION_TODAY_LUNCH_CREATED: Reservation = {
  zzz_id: 1,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayLunch,
  zzz_time_of_day: "LUNCH",
  zzz_status: "CREATED",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_TODAY_BREAKFAST_SEARCHING: Reservation = {
  zzz_id: 2,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayBreakfast,
  zzz_time_of_day: "BREAKFAST",
  zzz_status: "SEARCHING",
  zzz_guest_count: 3,
};

const MOCK_RESERVATION_TOMORROW_DINNER_CONFIRMED: Reservation = {
  zzz_id: 3,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: tomorrowDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 3,
};

const MOCK_RESERVATION_TOMORROW_BREAKFAST_CANCELLED: Reservation = {
  zzz_id: 4,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: tomorrowBreakfast,
  zzz_time_of_day: "BREAKFAST",
  zzz_status: "CANCELLED",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_TODAY_LUNCH_CANCELLED: Reservation = {
  zzz_id: 5,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayLunch,
  zzz_time_of_day: "LUNCH",
  zzz_status: "CANCELLED",
  zzz_guest_count: 5,
};

const MOCK_RESERVATION_TOMORROW_DINNER_CANCELLED: Reservation = {
  zzz_id: 6,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: tomorrowDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "CANCELLED",
  zzz_guest_count: 1,
};

const MOCK_RESERVATION_TODAY_SNACK_CONFIRMED: Reservation = {
  zzz_id: 7,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todaySnack,
  zzz_time_of_day: "SNACK",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 6,
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_2: Reservation = {
  zzz_id: 8,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_3: Reservation = {
  zzz_id: 9,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner2,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 3,
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_4: Reservation = {
  zzz_id: 10,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 4,
};

const MOCK_RESERVATION_TODAY_DINNER_CONFIRMED_5: Reservation = {
  zzz_id: 11,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "CONFIRMED",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_1: Reservation = {
  zzz_id: 12,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: tomorrowLunch,
  zzz_time_of_day: "LUNCH",
  zzz_status: "SEARCHING",
  zzz_guest_count: 4,
};

const MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_2: Reservation = {
  zzz_id: 13,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: tomorrowLunch2,
  zzz_time_of_day: "LUNCH",
  zzz_status: "SEARCHING",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_AFTER_TOMORROW_BREAKFAST_PENDING: Reservation = {
  zzz_id: 14,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: afterTomorrowBreakfast,
  zzz_time_of_day: "BREAKFAST",
  zzz_status: "SEARCHING",
  zzz_guest_count: 3,
};

const MOCK_RESERVATION_TODAY_DINNER_PEND_RESTRICTION: Reservation = {
  zzz_id: 15,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner,
  zzz_time_of_day: "DINNER",
  zzz_status: "SEARCHING",
  zzz_guest_count: 2,
};

const MOCK_RESERVATION_TODAY_DINNER_2_PEND_RESTRICTION: Reservation = {
  zzz_id: 16,
  zzz_user_id: MOCK_USER_TOURIST_WITH_ORDERS.id,
  zzz_service_at: todayDinner2,
  zzz_time_of_day: "DINNER",
  zzz_status: "SEARCHING",
  zzz_guest_count: 3,
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
  MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_1,
  MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_2,
  MOCK_RESERVATION_AFTER_TOMORROW_BREAKFAST_PENDING,
  MOCK_RESERVATION_TODAY_DINNER_PEND_RESTRICTION,
  MOCK_RESERVATION_TODAY_DINNER_2_PEND_RESTRICTION,
];

/**
 * Pure mock data for orders to be used in different services/stores
 */
export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    zzz_id: 1,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_LUNCH_CREATED.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "SEARCHING",
    zzz_notes: "Una persona es hipertensa, por favor cocinar sin sal.",
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_notes: "Una persona es hipertensa, por favor cocinar sin sal.",
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "CONFIRMED",
    zzz_confirmed_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_notes: "Alérgico a las nueces y frutos secos.",
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
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
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
  {
    zzz_id: 12,
    zzz_reservation_id: MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_1.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 18,
        zzz_order_id: 12,
        zzz_catalog_item_id: ASADO_POLLO.zzz_id,
        zzz_quantity: 4,
        zzz_price: ASADO_POLLO.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
  {
    zzz_id: 13,
    zzz_reservation_id: MOCK_RESERVATION_TOMORROW_LUNCH_PENDING_2.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 19,
        zzz_order_id: 13,
        zzz_catalog_item_id: EMPANADAS_VERDURA_DOCENA.zzz_id,
        zzz_quantity: 1,
        zzz_price: EMPANADAS_VERDURA_DOCENA.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
  {
    zzz_id: 14,
    zzz_reservation_id: MOCK_RESERVATION_AFTER_TOMORROW_BREAKFAST_PENDING.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_items: [
      {
        zzz_id: 20,
        zzz_order_id: 14,
        zzz_catalog_item_id: REPOLLO_ASADO.zzz_id,
        zzz_quantity: 3,
        zzz_price: REPOLLO_ASADO.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
  {
    zzz_id: 15,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_PEND_RESTRICTION.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_notes: "Una persona es Celíaca (por favor, sin gluten)",
    zzz_items: [
      {
        zzz_id: 21,
        zzz_order_id: 15,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 2,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
  {
    zzz_id: 16,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_PEND_RESTRICTION.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_notes: "Con mucha sal",
    zzz_items: [
      {
        zzz_id: 22,
        zzz_order_id: 16,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 3,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
  {
    zzz_id: 17,
    zzz_reservation_id: MOCK_RESERVATION_TODAY_DINNER_2_PEND_RESTRICTION.zzz_id,
    zzz_catalog_type_id: PRODUCT_CATEGORY_IDS.GASTRONOMY,
    zzz_global_status: "OFFER_PENDING",
    zzz_current_offer_venture_id: MOCK_VENTURE_WITH_ORDERS.id,
    zzz_notes: "Sin azucar",
    zzz_items: [
      {
        zzz_id: 23,
        zzz_order_id: 17,
        zzz_catalog_item_id: POSTRE_REGIONAL.zzz_id,
        zzz_quantity: 3,
        zzz_price: POSTRE_REGIONAL.zzz_price,
      },
    ],
    zzz_created_at: today,
    zzz_notify_whatsapp: true,
  },
];
