import { render, screen, fireEvent, waitFor } from "./utils/test-utils";
import CatalogScreen from "../app/tourist/catalog";
import { useOrderContextStore } from "../stores/order-context.store";
import { useCatalogStore } from "../stores/catalog.store";
import { useOrdersStore } from "../stores/orders.store";
import { useAuthStore } from "../stores/auth.store";
import { router } from "expo-router";

// Mocking all involved stores
jest.mock("../stores/order-context.store");
jest.mock("../stores/catalog.store");
jest.mock("../stores/orders.store");
jest.mock("../stores/auth.store");

const mockServices = [
  {
    id: 1,
    name_i18n: { es: "Empanadas", en: "Empanadas" },
    description_i18n: { es: "De carne", en: "Meat" },
    price: 1500,
    catalog_type_id: 1, // GASTRONOMY
    image_url: "test.jpg",
  },
];

describe("Catalog & Order Functional Flow", () => {
  const mockDate = new Date("2026-04-20T12:00:00Z");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setupMocks = (overrides = {} as any) => {
    const defaultState = {
      auth: { userRole: "TOURIST", isAuthenticated: true },
      catalog: { services: mockServices, isLoading: false, fetchServices: jest.fn() },
      orders: { activeOrders: [], fetchOrders: jest.fn(), cancelOrder: jest.fn() },
      context: {
        selectedDate: mockDate,
        selectedMoment: "LUNCH",
        guestCount: 2,
        isValid: () => true,
      },
    };

    const finalAuth = { ...defaultState.auth, ...overrides.auth };
    const finalCatalog = { ...defaultState.catalog, ...overrides.catalog };
    const finalOrders = { ...defaultState.orders, ...overrides.orders };
    const finalContext = { ...defaultState.context, ...overrides.context };

    (useAuthStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalAuth) : finalAuth,
    );
    (useCatalogStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalCatalog) : finalCatalog,
    );
    (useOrdersStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalOrders) : finalOrders,
    );
    (useOrderContextStore as unknown as jest.Mock).mockImplementation((sel) =>
      sel ? sel(finalContext) : finalContext,
    );

    return { finalOrders };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("should redirect to setup screen if context is missing", async () => {
    setupMocks({
      context: { selectedDate: null, selectedMoment: null, isValid: () => false },
    });

    render(<CatalogScreen />);
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/tourist");
    });
  });

  it("should show order summary footer when items are added", async () => {
    const mockOrders = [
      {
        id: 101,
        catalog_item_id: 1,
        quantity: 2,
        price_at_purchase: 1500,
        service_date: mockDate,
        time_of_day: "LUNCH",
      },
    ];

    setupMocks({
      orders: { activeOrders: mockOrders, fetchOrders: jest.fn() },
    });

    render(<CatalogScreen />);

    expect(await screen.findByText(/catalog.reservation.total_items/i)).toBeTruthy();
    expect(await screen.findByText(/3[.,]000/i)).toBeTruthy();
  });

  it("should expand summary and show individual items when total is clicked", async () => {
    const mockOrders = [
      {
        id: 101,
        catalog_item_id: 1,
        quantity: 2,
        price_at_purchase: 1500,
        service_date: mockDate,
        time_of_day: "LUNCH",
      },
    ];

    setupMocks({
      orders: { activeOrders: mockOrders, fetchOrders: jest.fn() },
    });

    render(<CatalogScreen />);

    // Tap the summary area (where total is shown)
    const totalText = await screen.findByText(/3[.,]000/i);
    fireEvent.press(totalText);

    // Verify item from summary list is visible (Empanadas)
    // We use findByText to wait for the state transition (render summary)
    expect(await screen.findAllByText(/Empanadas/i)).toHaveLength(2); // One in catalog, one in summary
  });

  it("should call cancelOrder when removing item from expanded summary", async () => {
    const cancelMock = jest.fn();
    const mockOrders = [
      {
        id: 101,
        catalog_item_id: 1,
        quantity: 2,
        price_at_purchase: 1500,
        service_date: mockDate,
        time_of_day: "LUNCH",
      },
    ];

    setupMocks({
      orders: { activeOrders: mockOrders, fetchOrders: jest.fn(), cancelOrder: cancelMock },
    });

    render(<CatalogScreen />);

    // Expand summary
    fireEvent.press(await screen.findByText(/3[.,]000/i));

    // Find the trash icon via testID
    const deleteBtn = await screen.findByTestId("order-delete-button-101");
    fireEvent.press(deleteBtn);

    // Alert should appear
    expect(await screen.findByText(/catalog.reservation.remove_confirm_title/i)).toBeTruthy();

    // Click "common.delete" in the alert
    const confirmDeleteBtn = screen.getByText(/common.delete/i);
    fireEvent.press(confirmDeleteBtn);

    // Verify cancelOrder was called with the correct ID
    await waitFor(() => {
      expect(cancelMock).toHaveBeenCalledWith(101);
    });
  });

  it("should show empty state when no services are available", async () => {
    setupMocks({
      catalog: { services: [], isLoading: false, fetchServices: jest.fn() },
    });

    render(<CatalogScreen />);

    expect(await screen.findByText(/catalog.empty/i)).toBeTruthy();
  });

  it("should trigger confirmation flow and redirect after success", async () => {
    const mockOrders = [
      {
        id: 101,
        catalog_item_id: 1,
        quantity: 2,
        price_at_purchase: 1500,
        service_date: mockDate,
        time_of_day: "LUNCH",
      },
    ];

    setupMocks({
      orders: { activeOrders: mockOrders, fetchOrders: jest.fn() },
    });

    render(<CatalogScreen />);

    // Click Confirm button in footer
    const confirmBtn = await screen.findByText(/orders.confirm/i);
    fireEvent.press(confirmBtn);

    // Alert should appear. Check for alert title (catalog.reservation.confirm_order_title)
    expect(await screen.findByText(/catalog.reservation.confirm_order_title/i)).toBeTruthy();

    // Click "Confirm" in the Alert (AppAlert uses Button internally)
    const alertConfirmBtn = screen.getByText(/common.confirm/i);
    fireEvent.press(alertConfirmBtn);

    // Should redirect to orders
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/tourist/orders");
    });
  });
});
