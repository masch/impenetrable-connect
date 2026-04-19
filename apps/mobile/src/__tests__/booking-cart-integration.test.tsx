import { render, screen, fireEvent } from "./utils/test-utils";
import BookingScreen from "../app/tourist/booking";
import { useCartStore } from "../stores/cart.store";
import { useCatalogStore } from "../stores/catalog.store";
import { useReservationStore } from "../stores/reservation.store";
import { useAuthStore } from "../stores/auth.store";

// Mocking all involved stores
jest.mock("../stores/cart.store");
jest.mock("../stores/catalog.store");
jest.mock("../stores/reservation.store");
jest.mock("../stores/auth.store");

jest.mock("../hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "catalog.reservation.total_items") {
        return params?.count === 1 ? "Total (1 plato)" : `Total (${params?.count} platos)`;
      }
      return key;
    },
    getLocalizedName: (obj: Record<string, string>) => obj?.en || obj?.es || "---",
    locale: "es",
  }),
}));

const mockServices = [
  {
    id: 1,
    name_i18n: { es: "Beef Empanadas 1/2 dozen", en: "Beef Empanadas 1/2 dozen" },
    description_i18n: { es: "De carne", en: "Meat" },
    price: 9500,
    catalog_category_id: 1, // GASTRONOMY
    image_url: "test.jpg",
  },
];

describe("Booking & Cart Integration", () => {
  const mockDate = new Date("2026-04-20T12:00:00Z");

  interface StoreOverrides {
    auth?: Record<string, unknown>;
    catalog?: Record<string, unknown>;
    reservation?: Record<string, unknown>;
    cart?: Record<string, unknown>;
  }

  const setupMocks = (overrides: StoreOverrides = {}) => {
    const defaultState = {
      auth: { userRole: "TOURIST", isAuthenticated: true },
      catalog: { services: mockServices, isLoading: false, fetchServices: jest.fn() },
      reservation: {
        activeOrders: [],
        fetchOrders: jest.fn(),
        cancelOrder: jest.fn(),
        addOrder: jest.fn(),
      },
      cart: {
        selectedDate: mockDate,
        selectedMoment: "DINNER",
        cartItems: [],
        isValid: () => true,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        clearCart: jest.fn(),
      },
    };

    const finalAuth = { ...defaultState.auth, ...overrides.auth };
    const finalCatalog = { ...defaultState.catalog, ...overrides.catalog };
    const finalReservation = { ...defaultState.reservation, ...overrides.reservation };
    const finalCart = { ...defaultState.cart, ...overrides.cart };

    (useAuthStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalAuth) : finalAuth,
    );
    (useCatalogStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalCatalog) : finalCatalog,
    );
    (useReservationStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalReservation) : finalReservation,
    );
    (useCartStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalCart) : finalCart,
    );

    return { finalReservation, finalCart };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should persist item quantity when re-opening the reservation modal from the catalog", async () => {
    const mockCartItems = [
      {
        catalog_item_id: 1,
        quantity: 3,
        price: 9500,
      },
    ];

    setupMocks({
      cart: {
        cartItems: mockCartItems,
        isValid: () => true,
        selectedDate: mockDate,
        selectedMoment: "DINNER",
      },
    });

    render(<BookingScreen />);

    // 1. Click the service in the catalog list
    const services = await screen.findAllByText("Beef Empanadas 1/2 dozen");
    fireEvent.press(services[0]);

    // 2. The ReservationModal should open.
    const quantityText = await screen.findByText("3");
    expect(quantityText).toBeTruthy();

    // 3. Close the modal (simulate confirm or just close)
    const confirmButton = screen.getByText(/add_to_selection|update/i);
    fireEvent.press(confirmButton);

    // 4. Validate the summary at the bottom
    // Total dishes: 3
    const totalDishesText = await screen.findByText(/Total \(3 platos\)/i);
    expect(totalDishesText).toBeTruthy();

    // Total price: $ 28.500
    const totalPriceText = await screen.findByText(/\$?\s*28[.,]500/i);
    expect(totalPriceText).toBeTruthy();
  });
});
