import { create } from "zustand";
import type { ServiceMoment } from "@repo/shared";

interface CartItem {
  catalog_item_id: number;
  quantity: number;
  price: number;
}

interface CartState {
  selectedDate: Date | null;
  selectedMoment: ServiceMoment | null;
  cartItems: CartItem[];

  // Actions
  setContext: (date: Date, moment: ServiceMoment) => void;
  resetContext: () => void;
  isValid: () => boolean;

  // Cart Actions
  addItem: (item: CartItem) => void;
  removeItem: (catalogItemId: number) => void;
  updateQuantity: (catalogItemId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  selectedDate: null,
  selectedMoment: null,
  cartItems: [],

  setContext: (selectedDate, selectedMoment) => set({ selectedDate, selectedMoment }),

  resetContext: () => set({ selectedDate: null, selectedMoment: null, cartItems: [] }),

  isValid: () => {
    const { selectedDate, selectedMoment } = get();
    return !!selectedDate && !!selectedMoment;
  },

  addItem: (newItem) => {
    const { cartItems } = get();
    const existingIndex = cartItems.findIndex((i) => i.catalog_item_id === newItem.catalog_item_id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newItem.quantity,
      };
      set({ cartItems: updated });
    } else {
      set({ cartItems: [...cartItems, newItem] });
    }
  },

  removeItem: (catalogItemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.catalog_item_id !== catalogItemId),
    }));
  },

  updateQuantity: (catalogItemId, quantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.catalog_item_id === catalogItemId ? { ...i, quantity } : i,
      ),
    }));
  },

  clearCart: () => set({ cartItems: [] }),
}));
