import { create } from "zustand";
import type { ServiceMoment } from "@repo/shared";

interface CartItem {
  zzz_catalog_item_id: number;
  zzz_quantity: number;
  zzz_price: number;
}

interface CartState {
  selectedDate: Date | null;
  selectedMoment: ServiceMoment | null;
  guestCount: number;
  cartItems: CartItem[];

  // Actions
  setContext: (date: Date, moment: ServiceMoment) => void;
  setGuestCount: (count: number) => void;
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
  guestCount: 2, // Default to 2 people
  cartItems: [],

  setContext: (selectedDate, selectedMoment) => set({ selectedDate, selectedMoment }),

  setGuestCount: (guestCount) => set({ guestCount }),

  resetContext: () =>
    set({ selectedDate: null, selectedMoment: null, guestCount: 2, cartItems: [] }),

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
