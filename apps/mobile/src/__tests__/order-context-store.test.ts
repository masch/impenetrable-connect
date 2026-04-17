import { useOrderContextStore } from "../stores/order-context.store";

describe("Order Context Store", () => {
  beforeEach(() => {
    useOrderContextStore.getState().resetContext();
  });

  it("should have initial state correctly", () => {
    const state = useOrderContextStore.getState();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedMoment).toBeNull();
    expect(state.guestCount).toBe(1);
    expect(state.isValid()).toBe(false);
  });

  it("should update context correctly", () => {
    const date = new Date();
    useOrderContextStore.getState().setContext(date, "LUNCH", 4);

    const state = useOrderContextStore.getState();
    expect(state.selectedDate).toEqual(date);
    expect(state.selectedMoment).toBe("LUNCH");
    expect(state.guestCount).toBe(4);
    expect(state.isValid()).toBe(true);
  });

  it("should not be valid if only date is set", () => {
    useOrderContextStore.setState({ selectedDate: new Date(), selectedMoment: null });
    expect(useOrderContextStore.getState().isValid()).toBe(false);
  });

  it("should not be valid if only moment is set", () => {
    useOrderContextStore.setState({ selectedDate: null, selectedMoment: "DINNER" });
    expect(useOrderContextStore.getState().isValid()).toBe(false);
  });

  it("should reset context correctly", () => {
    useOrderContextStore.getState().setContext(new Date(), "DINNER", 2);
    useOrderContextStore.getState().resetContext();

    const state = useOrderContextStore.getState();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedMoment).toBeNull();
    expect(state.guestCount).toBe(1);
  });
});
