import { useMemo } from "react";
import { I18n } from "i18n-js";

import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import { useLocaleStore } from "../stores/locale.store";

const translations = { en, es };

const i18n = new I18n(translations);
i18n.enableFallback = true;

export function useTranslations() {
  const locale = useLocaleStore((state) => state.locale);

  const t = useMemo(() => {
    i18n.locale = locale;
    return (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
  }, [locale]);

  return { t, locale };
}

export function useLocale() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const initializeLocale = useLocaleStore((state) => state.initializeLocale);

  return { locale, setLocale, initializeLocale };
}

/**
 * Hook to get localized name from i18n object with fallback chain
 * Usage: const name = useLocalizedName(item.name_i18n)
 * Returns: name in current locale > Spanish > English
 */
export function useLocalizedName(name_i18n: Record<string, string> | undefined): string {
  const locale = useLocaleStore((state) => state.locale);

  if (!name_i18n) return "";

  return name_i18n[locale] || name_i18n.es || name_i18n.en || "";
}

// Alias for backwards compatibility
export const getLocalizedName = useLocalizedName;
