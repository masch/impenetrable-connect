import { useMemo } from "react";
import { I18n } from "i18n-js";

import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import { useLocaleStore } from "../stores/locale.store";

const translations = { en, es };

const i18n = new I18n(translations);
i18n.enableFallback = true;

export function useI18n() {
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
