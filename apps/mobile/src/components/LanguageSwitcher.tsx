import { useEffect } from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";
import { useLocale, useTranslations } from "../hooks/useI18n";

const AVAILABLE_LOCALES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, initializeLocale } = useLocale();
  const { t } = useTranslations();

  useEffect(() => {
    initializeLocale();
  }, [initializeLocale]);

  return (
    <View className="flex-row gap-0">
      {AVAILABLE_LOCALES.map((lang) => {
        const isActive = locale === lang.code;
        return (
          <Button
            testID={`language-switcher-${lang.code}`}
            key={lang.code}
            variant="ghost"
            accessibilityLabel={t("common.switch_language", { lang: lang.label })}
            className={`
              px-4 py-2 min-h-touch rounded-none
              ${isActive ? "bg-primary-container" : "bg-surface-container-highest"}
            `}
            onPress={() => setLocale(lang.code)}
          >
            <Text
              className={`
                text-sm font-medium
                ${isActive ? "text-on-primary" : "text-on-surface opacity-50"}
              `}
            >
              {lang.label}
            </Text>
          </Button>
        );
      })}
    </View>
  );
}
