import { useAgendaStore } from "../agenda.store";
import { useAuthStore } from "../auth.store";
import { getMockAgendaOrders } from "../../mocks/agenda";
import { MOCK_USER_ENTREPRENEUR_WITH_ORDERS, Order } from "@repo/shared";

describe("Agenda Store", () => {
  beforeEach(() => {
    // Reset store states
    useAgendaStore.setState({ orders: [], isLoading: false, error: null });
    // Set a default user for fetching logic
    useAuthStore.setState({
      currentUser: MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
      isAuthenticated: true,
    });
  });

  it("should fetch agenda orders for a specific date", async () => {
    const store = useAgendaStore.getState();
    const today = new Date();

    await store.fetchAgenda(today);

    // Note: if this fails, check if the mock data dates match today
    expect(useAgendaStore.getState().orders.length).toBeGreaterThan(0);
    expect(useAgendaStore.getState().isLoading).toBe(false);
  });

  it("should calculate occupation stats correctly", async () => {
    // Setup state
    useAgendaStore.setState({ orders: getMockAgendaOrders() });

    const stats = useAgendaStore.getState().getOccupationStats(20); // Max capacity 20

    // Updated: Today in mocks now has 34 guests (including the new pending order we added earlier)
    expect(stats.occupied).toBe(34);
    expect(stats.total).toBe(20);
  });

  it("should calculate occupation based on zzz_guest_count and ignore CANCELLED orders", () => {
    const mockOrders = [
      {
        zzz_id: 1,
        zzz_global_status: "CONFIRMED",
        zzz_reservation: { zzz_guest_count: 5 },
      },
      {
        zzz_id: 2,
        zzz_global_status: "CONFIRMED",
        zzz_reservation: { zzz_guest_count: 3 },
      },
      {
        zzz_id: 3,
        zzz_global_status: "CANCELLED",
        zzz_reservation: { zzz_guest_count: 10 },
      },
    ] as Order[];

    useAgendaStore.setState({ orders: mockOrders });

    const stats = useAgendaStore.getState().getOccupationStats(20);

    // Should be 5 + 3 = 8. The CANCELLED one (10) must be ignored.
    expect(stats.occupied).toBe(8);
  });
});
