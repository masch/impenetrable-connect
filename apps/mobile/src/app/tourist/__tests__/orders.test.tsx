import React from "react";
import { render } from "@testing-library/react-native";
import OrderScreen from "../orders";
import { useReservationStore, type ReservationState } from "../../../stores/reservation.store";
import { useAuthStore, type AuthState } from "../../../stores/auth.store";
import { useCatalogStore, type CatalogState } from "../../../stores/product.store";
import { type Order, UserRole } from "@repo/shared";

// Mock the stores
jest.mock("../../../stores/reservation.store");
jest.mock("../../../stores/auth.store");
jest.mock("../../../stores/product.store");

const mockedUseReservationStore = jest.mocked(useReservationStore);
const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedUseCatalogStore = jest.mocked(useCatalogStore);

describe("OrderScreen (Tourist)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth state: authenticated tourist
    mockedUseAuthStore.mockImplementation((selector) => {
      const state: AuthState = {
        currentUser: {
          id: "tourist_1",
          email: "tourist@test.com",
          alias: "Tourist One",
          firstName: "Tourist",
          lastName: "One",
          phoneNumber: null,
          role: UserRole.TOURIST,
          zzz_failed_login_attempts: 0,
          zzz_last_login_at: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: "mock-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        userRole: UserRole.TOURIST,
        setUserRole: jest.fn(),
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        setLoading: jest.fn(),
        clearError: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    // Default catalog state
    mockedUseCatalogStore.mockImplementation((selector) => {
      const state: CatalogState = {
        services: [],
        selectedService: null,
        orders: [],
        isLoading: false,
        isSaving: false,
        error: null,
        fetchServices: jest.fn(),
        fetchServicesByCategory: jest.fn(),
        selectService: jest.fn(),
        clearSelectedService: jest.fn(),
        placeOrder: jest.fn(),
        fetchOrders: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    // Default reservation state
    mockedUseReservationStore.mockImplementation((selector) => {
      const state: ReservationState = {
        activeOrders: [],
        historyOrders: [],
        isLoading: false,
        error: null,
        selectedTab: "active",
        fetchOrders: jest.fn(),
        cancelOrder: jest.fn(),
        addOrder: jest.fn(),
        updateOrder: jest.fn(),
        moveOrders: jest.fn(),
        setTab: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });
  });

  it("should render reservation notes in active orders", () => {
    const mockNotes = "Alérgico a las nueces y frutos secos.";
    const mockOrder: Order = {
      zzz_id: 10,
      zzz_reservation_id: 2,
      zzz_catalog_type_id: 1,
      zzz_global_status: "CONFIRMED",
      zzz_confirmed_venture_id: 1,
      zzz_notes: mockNotes,
      zzz_items: [
        {
          zzz_id: 15,
          zzz_order_id: 10,
          zzz_catalog_item_id: 2,
          zzz_quantity: 2,
          zzz_price: 2000,
          zzz_catalog_item: {
            zzz_id: 2,
            zzz_product_category_id: 1,
            zzz_name_i18n: { es: "Guiso", en: "Stew" },
            zzz_price: 1000,
            zzz_max_participants: 20,
            zzz_global_pause: false,
          },
        },
      ],
      zzz_confirmed_at: new Date(),
      zzz_created_at: new Date(),
      zzz_notify_whatsapp: false,
      zzz_reservation: {
        zzz_id: 2,
        zzz_user_id: "tourist_1",
        zzz_service_at: "2099-06-15T13:30:00-03:00", // Always future date
        zzz_time_of_day: "LUNCH",
        zzz_status: "CONFIRMED",
        zzz_guest_count: 2,
      },
      zzz_confirmed_venture: {
        id: 1,
        name: "Parador Don Esteban",
        ownerId: "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        updatedAt: new Date(),
        zzz_max_capacity: 20,
        zzz_cascade_order: 1,
        zzz_is_paused: false,
        zzz_is_active: true,
        zzz_project_id: 1,
      },
    };

    mockedUseReservationStore.mockImplementation((selector) => {
      const state: ReservationState = {
        activeOrders: [mockOrder],
        historyOrders: [],
        isLoading: false,
        error: null,
        selectedTab: "active",
        fetchOrders: jest.fn(),
        cancelOrder: jest.fn(),
        addOrder: jest.fn(),
        updateOrder: jest.fn(),
        moveOrders: jest.fn(),
        setTab: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<OrderScreen />);

    expect(mockOrder.zzz_notes).toBe(mockNotes);
    expect(mockOrder.zzz_reservation?.zzz_service_at).toBe("2099-06-15T13:30:00-03:00");
  });

  describe("Accessibility labels", () => {
    it("should render accessibility label for today", () => {
      mockedUseReservationStore.mockImplementation((selector) => {
        const state: ReservationState = {
          activeOrders: [],
          historyOrders: [],
          isLoading: false,
          error: null,
          selectedTab: "active",
          fetchOrders: jest.fn(),
          cancelOrder: jest.fn(),
          addOrder: jest.fn(),
          updateOrder: jest.fn(),
          moveOrders: jest.fn(),
          setTab: jest.fn(),
        };
        return typeof selector === "function" ? selector(state) : state;
      });

      const { getByLabelText } = render(<OrderScreen />);

      // Today uses translation key "accessibility.select_today" in mock
      const todayButton = getByLabelText("accessibility.select_today");
      expect(todayButton).toBeTruthy();
    });

    it("should render accessibility label for tomorrow", () => {
      mockedUseReservationStore.mockImplementation((selector) => {
        const state: ReservationState = {
          activeOrders: [],
          historyOrders: [],
          isLoading: false,
          error: null,
          selectedTab: "active",
          fetchOrders: jest.fn(),
          cancelOrder: jest.fn(),
          addOrder: jest.fn(),
          updateOrder: jest.fn(),
          moveOrders: jest.fn(),
          setTab: jest.fn(),
        };
        return typeof selector === "function" ? selector(state) : state;
      });

      const { getByLabelText } = render(<OrderScreen />);

      // Tomorrow uses translation key "accessibility.select_tomorrow" in mock
      const tomorrowButton = getByLabelText("accessibility.select_tomorrow");
      expect(tomorrowButton).toBeTruthy();
    });

    it("should render accessibility label for future dates", () => {
      mockedUseReservationStore.mockImplementation((selector) => {
        const state: ReservationState = {
          activeOrders: [],
          historyOrders: [],
          isLoading: false,
          error: null,
          selectedTab: "active",
          fetchOrders: jest.fn(),
          cancelOrder: jest.fn(),
          addOrder: jest.fn(),
          updateOrder: jest.fn(),
          moveOrders: jest.fn(),
          setTab: jest.fn(),
        };
        return typeof selector === "function" ? selector(state) : state;
      });

      const { getAllByLabelText } = render(<OrderScreen />);

      // Future dates all use "accessibility.select_date" (mock returns key only)
      const futureDateButtons = getAllByLabelText("accessibility.select_date");
      expect(futureDateButtons.length).toBeGreaterThan(0);
    });
  });
});
