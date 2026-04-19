import { Text, View } from "react-native";
import { Button } from "./Button";
import { Language } from "@repo/shared";

interface FormLanguageSelectorProps {
  label: string;
  selectedLanguages: Language[];
  onToggle: (lang: Language) => void;
  availableLanguages?: Language[];
  error?: string;
}

export function FormLanguageSelector({
  label,
  selectedLanguages,
  onToggle,
  availableLanguages = ["es", "en"],
  error,
}: FormLanguageSelectorProps) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-medium text-on-surface mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {availableLanguages.map((lang) => {
          const isSelected = selectedLanguages.includes(lang);
          return (
            <Button
              key={lang}
              variant="ghost"
              className={`
                px-5 py-3 min-h-touch rounded-none
                ${isSelected ? "bg-primary-container" : "bg-surface-container-highest"}
              `}
              onPress={() => onToggle(lang)}
            >
              <Text
                className={`
                  text-base font-medium uppercase
                  ${isSelected ? "text-on-primary" : "text-on-surface opacity-50"}
                `}
              >
                {lang}
              </Text>
            </Button>
          );
        })}
      </View>
      {error && <Text className="text-xs text-on-error-container mt-2">{error}</Text>}
    </View>
  );
}
