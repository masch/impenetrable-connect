import { useMemo, useState, useEffect } from "react";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";

const translations = { en, es };

const i18n = new I18n(translations);
i18n.enableFallback = true;

export function useI18n() {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    const deviceLocale = getLocales()[0]?.languageCode ?? "en";
    setLocale(deviceLocale);
  }, []);

  const t = useMemo(() => {
    i18n.locale = locale;
    return (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
  }, [locale]);

  return { t, locale };
}
