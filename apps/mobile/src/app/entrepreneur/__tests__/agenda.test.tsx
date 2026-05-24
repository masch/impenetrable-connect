import React from "react";
import { render, screen } from "@testing-library/react-native";
import AgendaScreen from "../agenda";
import { useAgendaStore, type AgendaState } from "../../../stores/agenda.store";
import { UserRole, type Order } from "@repo/shared";

// Mock the store to control data
jest.mock("../../../stores/agenda.store");
const mockedUseAgendaStore = jest.mocked(useAgendaStore);

describe("AgendaScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAgendaStore.mockImplementation((selector) => {
      const state: AgendaState = {
        allOrders: [],
        orders: [],
        pendingOrders: [],
        isLoading: false,
        isLoadingPending: false,
        error: null,
        fetchAgenda: jest.fn(),
        fetchPendingOrders: jest.fn(),
        acceptOrder: jest.fn(),
        declineOrder: jest.fn(),
        getOccupationStats: () => ({ occupied: 0, total: 20 }),
        getDayCount: () => 0,
        reset: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });
  });

  it("should render the screen title", () => {
    render(<AgendaScreen />);
    expect(screen.getByText("agenda.title")).toBeTruthy();
  });

  it("should call fetchAgenda on mount", () => {
    const fetchAgenda = jest.fn();
    mockedUseAgendaStore.mockImplementation((selector) => {
      const state: AgendaState = {
        allOrders: [],
        orders: [],
        pendingOrders: [],
        isLoading: false,
        isLoadingPending: false,
        error: null,
        fetchAgenda: fetchAgenda, // Use the mock we defined
        fetchPendingOrders: jest.fn(),
        acceptOrder: jest.fn(),
        declineOrder: jest.fn(),
        getOccupationStats: () => ({ occupied: 0, total: 20 }),
        getDayCount: () => 0,
        reset: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<AgendaScreen />);
    expect(fetchAgenda).toHaveBeenCalled();
  });

  it("should render reservation notes in orders", () => {
    const mockId = (n: number): string => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
    const mockNotes = "Una persona es hipertensa, por favor cocinar sin sal.";
    const mockOrder: Order = {
      zzz_id: mockId(9),
      zzz_reservation_id: mockId(1),
      zzz_catalog_type_id: 1,
      zzz_global_status: "CONFIRMED",
      zzz_confirmed_venture_id: 1,
      zzz_notes: mockNotes,
      zzz_items: [
        {
          zzz_id: mockId(12),
          zzz_order_id: mockId(9),
          zzz_catalog_item_id: 1,
          zzz_quantity: 1,
          zzz_price: 1500,
          zzz_catalog_item: {
            zzz_id: 1,
            zzz_product_category_id: 1,
            zzz_name_i18n: { es: "Empanadas", en: "Empanadas" },
            zzz_price: 1500,
            zzz_max_participants: 10,
            zzz_global_pause: false,
          },
        },
      ],
      zzz_confirmed_at: new Date(),
      zzz_created_at: new Date(),
      zzz_notify_whatsapp: false,
      zzz_reservation: {
        zzz_id: mockId(1),
        zzz_user_id: "user-1",
        zzz_service_at: "2024-01-15T20:30:00-03:00",
        zzz_time_of_day: "DINNER",
        zzz_status: "CONFIRMED",
        zzz_guest_count: 3,
        zzz_user: {
          id: "user-1",
          alias: "Familia Gómez",
          role: UserRole.TOURIST,
          zzz_failed_login_attempts: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: "test@test.com",
          firstName: "Familia",
          lastName: "Gómez",
          phoneNumber: null,
          zzz_last_login_at: null,
        },
      },
    };

    mockedUseAgendaStore.mockImplementation((selector) => {
      const state: AgendaState = {
        allOrders: [mockOrder],
        orders: [mockOrder],
        pendingOrders: [],
        isLoading: false,
        isLoadingPending: false,
        error: null,
        fetchAgenda: jest.fn(),
        fetchPendingOrders: jest.fn(),
        acceptOrder: jest.fn(),
        declineOrder: jest.fn(),
        getOccupationStats: () => ({ occupied: 3, total: 20 }),
        getDayCount: () => 1,
        reset: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<AgendaScreen />);

    expect(screen.getByText(mockNotes)).toBeTruthy();
  });
});
