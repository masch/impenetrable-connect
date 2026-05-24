import { render, screen, fireEvent, waitFor } from "./utils/test-utils";
import BookingScreen from "../app/tourist/booking";
import { useCartStore } from "../stores/cart.store";
import { useCatalogStore } from "../stores/product.store";
import { useReservationStore } from "../stores/reservation.store";
import { useAuthStore } from "../stores/auth.store";

// Set REST mode for this test file
jest.mock("../config/env", () => ({
  __esModule: true,
  default: { API_URL: "http://test.api/v1", USE_MOCKS: false },
}));

jest.mock("../stores/cart.store");
jest.mock("../stores/product.store");
jest.mock("../stores/reservation.store");
jest.mock("../stores/auth.store");
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn() },
}));

const mockDate = new Date("2026-04-20T12:00:00Z");
const mockServices = [
  {
    zzz_id: 1,
    zzz_name_i18n: { es: "Empanadas", en: "Empanadas" },
    zzz_description_i18n: { es: "De carne", en: "Meat" },
    zzz_price: 1500,
    zzz_product_category_id: 1,
    zzz_image_url: "empanadas6.jpg",
    zzz_service_moments: ["LUNCH", "DINNER"],
  },
];

function setupMocks(
  overrides: {
    cart?: Record<string, unknown>;
    catalog?: Record<string, unknown>;
    reservation?: Record<string, unknown>;
    auth?: Record<string, unknown>;
  } = {},
) {
  const defaultCart = {
    selectedDate: mockDate,
    selectedMoment: "LUNCH" as const,
    selectedTime: "12:00",
    guestCount: 2,
    cartItems: [{ zzz_catalog_item_id: 1, zzz_quantity: 2, zzz_price: 1500 }],
    isValid: () => true,
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    resetContext: jest.fn(),
  };

  const defaultCatalog = {
    services: mockServices,
    isLoading: false,
    fetchServices: jest.fn(),
    placeOrder: jest.fn(),
  };

  const defaultReservation = {
    activeOrders: [],
    fetchOrders: jest.fn(),
    cancelOrder: jest.fn(),
    addOrder: jest.fn(),
  };

  const defaultAuth = { isAuthenticated: true };

  const finalCart = { ...defaultCart, ...overrides.cart };
  const finalCatalog = { ...defaultCatalog, ...overrides.catalog };
  const finalReservation = { ...defaultReservation, ...overrides.reservation };
  const finalAuth = { ...defaultAuth, ...overrides.auth };

  const mockStore = (storeRef: unknown, state: Record<string, unknown>) => {
    const mock = storeRef as jest.Mock;
    mock.mockImplementation((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state));
    (mock as unknown as { getState: () => Record<string, unknown> }).getState = () => state;
  };

  mockStore(useAuthStore, finalAuth);
  mockStore(useCatalogStore, finalCatalog);
  mockStore(useReservationStore, finalReservation);
  mockStore(useCartStore, finalCart);

  return { finalCart, finalCatalog, finalReservation };
}

describe("Booking Flow - REST mode (USE_MOCKS=false)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("should call placeOrder from the store and navigate to orders on success", async () => {
    const mockOrder = {
      zzz_id: "order-uuid-456",
      zzz_reservation_id: "res-uuid-123",
      zzz_global_status: "SEARCHING" as const,
    };
    const placeOrderMock = jest.fn().mockResolvedValue(mockOrder);
    const addOrderMock = jest.fn();
    const clearCartMock = jest.fn();

    setupMocks({
      catalog: { placeOrder: placeOrderMock },
      reservation: { addOrder: addOrderMock },
      cart: { clearCart: clearCartMock },
    });

    render(<BookingScreen />);

    // Wait for the confirm button to appear
    await waitFor(() => {
      expect(screen.getByTestId("confirm-order-button")).toBeTruthy();
    });

    // Press confirm → shows AppAlert
    fireEvent.press(screen.getByTestId("confirm-order-button"));

    // Find the confirm action inside the alert
    const confirmActionBtn = await waitFor(() => screen.getByTestId("alert-action-confirm"));
    expect(confirmActionBtn).toBeTruthy();
    fireEvent.press(confirmActionBtn);

    // Verify placeOrder was called with correct args
    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledWith(
        mockDate,
        "LUNCH",
        [{ zzz_catalog_item_id: 1, zzz_quantity: 2, zzz_notes: undefined }],
        2,
        "12:00",
        undefined,
      );
    });

    // Verify store updates and navigation
    expect(addOrderMock).toHaveBeenCalledWith(mockOrder);
    expect(clearCartMock).toHaveBeenCalled();
  });

  it("should show error alert when placeOrder fails", async () => {
    const placeOrderMock = jest.fn().mockRejectedValue(new Error("Order failed"));

    setupMocks({
      catalog: { placeOrder: placeOrderMock },
    });

    render(<BookingScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-order-button")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("confirm-order-button"));

    const confirmActionBtn = await waitFor(() => screen.getByTestId("alert-action-confirm"));
    expect(confirmActionBtn).toBeTruthy();
    fireEvent.press(confirmActionBtn);

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalled();
    });

    // Error alert should be visible with the error message
    await waitFor(() => {
      expect(screen.getByText("errors.reservation_failed")).toBeTruthy();
    });
  });
});
