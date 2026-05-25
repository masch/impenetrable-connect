import { create } from "zustand";
import type { ServiceMoment, HourMinute } from "@repo/shared";

const DEFAULT_GUEST_COUNT = 2;

interface CartItem {
  zzz_catalog_item_id: number;
  zzz_quantity: number;
  zzz_price: number;
  zzz_notes?: string;
}

interface CartState {
  selectedDate: Date | null;
  selectedMoment: ServiceMoment | null;
  selectedTime: HourMinute | undefined;
  guestCount: number;
  cartItems: CartItem[];

  // Actions
  setContext: (date: Date, moment: ServiceMoment, time?: HourMinute) => void;
  setGuestCount: (count: number | ((prev: number) => number)) => void;
  setSelectedTime: (time: HourMinute | undefined) => void;
  resetContext: () => void;
  isValid: () => boolean;

  // Cart Actions
  addItem: (item: CartItem) => void;
  removeItem: (catalogItemId: number) => void;
  updateQuantity: (catalogItemId: number, zzz_quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  selectedDate: null,
  selectedMoment: null,
  selectedTime: undefined,
  guestCount: DEFAULT_GUEST_COUNT, // Default to 2 people
  cartItems: [],

  setContext: (selectedDate, selectedMoment, selectedTime) =>
    set({ selectedDate, selectedMoment, selectedTime }),

  setGuestCount: (guestCount) =>
    set(
      typeof guestCount === "function"
        ? (state) => ({ guestCount: guestCount(state.guestCount) })
        : { guestCount },
    ),

  setSelectedTime: (selectedTime) => set({ selectedTime }),

  resetContext: () =>
    set({
      selectedDate: null,
      selectedMoment: null,
      selectedTime: undefined,
      guestCount: DEFAULT_GUEST_COUNT,
      cartItems: [],
    }),

  isValid: () => {
    const { selectedDate, selectedMoment } = get();
    return !!selectedDate && !!selectedMoment;
  },

  addItem: (newItem) => {
    const { cartItems } = get();
    const existingIndex = cartItems.findIndex(
      (i) => i.zzz_catalog_item_id === newItem.zzz_catalog_item_id,
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        zzz_quantity: newItem.zzz_quantity,
      };
      set({ cartItems: updated });
    } else {
      set({ cartItems: [...cartItems, newItem] });
    }
  },

  removeItem: (catalogItemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.zzz_catalog_item_id !== catalogItemId),
    }));
  },

  updateQuantity: (catalogItemId, zzz_quantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.zzz_catalog_item_id === catalogItemId ? { ...i, zzz_quantity } : i,
      ),
    }));
  },

  clearCart: () => set({ cartItems: [] }),
}));
