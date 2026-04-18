import { useCartStore } from "../stores/cart.store";

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.getState().resetContext();
  });

  it("should have initial state correctly", () => {
    const state = useCartStore.getState();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedMoment).toBeNull();
    expect(state.cartItems).toEqual([]);
    expect(state.isValid()).toBe(false);
  });

  it("should update context correctly", () => {
    const date = new Date();
    useCartStore.getState().setContext(date, "LUNCH");

    const state = useCartStore.getState();
    expect(state.selectedDate).toEqual(date);
    expect(state.selectedMoment).toBe("LUNCH");
    expect(state.isValid()).toBe(true);
  });

  it("should handle cart items correctly", () => {
    const item = { catalog_item_id: 1, quantity: 2, price: 500 };
    useCartStore.getState().addItem(item);

    let state = useCartStore.getState();
    expect(state.cartItems).toHaveLength(1);
    expect(state.cartItems[0]).toEqual(item);

    // Update quantity (re-add same item ID)
    useCartStore.getState().addItem({ ...item, quantity: 5 });
    state = useCartStore.getState();
    expect(state.cartItems).toHaveLength(1);
    expect(state.cartItems[0].quantity).toBe(5);

    // Remove item
    useCartStore.getState().removeItem(1);
    state = useCartStore.getState();
    expect(state.cartItems).toHaveLength(0);
  });

  it("should reset correctly including cart", () => {
    useCartStore.getState().addItem({ catalog_item_id: 1, quantity: 1, price: 100 });
    useCartStore.getState().resetContext();

    const state = useCartStore.getState();
    expect(state.cartItems).toEqual([]);
    expect(state.selectedDate).toBeNull();
  });
});
