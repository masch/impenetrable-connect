import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocale } from "../hooks/useI18n";

const AVAILABLE_LOCALES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, initializeLocale } = useLocale();

  useEffect(() => {
    initializeLocale();
  }, [initializeLocale]);

  return (
    <View className="flex-row gap-2">
      {AVAILABLE_LOCALES.map((lang) => (
        <Pressable
          key={lang.code}
          className={`px-2 py-1 rounded ${locale === lang.code ? "bg-green-600" : "bg-gray-200"}`}
          onPress={() => setLocale(lang.code)}
        >
          <Text
            className={`text-xs font-medium ${
              locale === lang.code ? "text-white" : "text-gray-700"
            }`}
          >
            {lang.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
