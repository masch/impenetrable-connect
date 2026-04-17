import { create } from "zustand";
import type { TimeOfDay } from "@repo/shared";

interface OrderContextState {
  selectedDate: Date | null;
  selectedMoment: TimeOfDay | null;
  guestCount: number;

  // Actions
  setContext: (date: Date, moment: TimeOfDay, guests?: number) => void;
  resetContext: () => void;
  isValid: () => boolean;
}

export const useOrderContextStore = create<OrderContextState>((set, get) => ({
  selectedDate: null,
  selectedMoment: null,
  guestCount: 1,

  setContext: (selectedDate, selectedMoment, guestCount) =>
    set({ selectedDate, selectedMoment, guestCount: guestCount ?? 1 }),

  resetContext: () => set({ selectedDate: null, selectedMoment: null, guestCount: 1 }),

  isValid: () => {
    const { selectedDate, selectedMoment } = get();
    return !!selectedDate && !!selectedMoment;
  },
}));
