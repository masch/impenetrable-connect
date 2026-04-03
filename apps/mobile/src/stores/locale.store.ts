import { create } from "zustand";
import { getLocales } from "expo-localization";

interface LocaleState {
  locale: string;
  setLocale: (locale: string) => void;
  initializeLocale: () => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",

  setLocale: (locale: string) => {
    set({ locale });
  },

  initializeLocale: () => {
    const deviceLocale = getLocales()[0]?.languageCode ?? "en";
    set({ locale: deviceLocale });
  },
}));
