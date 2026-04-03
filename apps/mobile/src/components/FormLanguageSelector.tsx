import { ReactNode } from "react";
import { Text, View, Pressable } from "react-native";
import { Language } from "@repo/shared";

interface FormLanguageSelectorProps {
  label: string;
  selectedLanguages: Language[];
  onToggle: (lang: Language) => void;
  availableLanguages?: Language[];
  extra?: ReactNode;
  error?: string;
}

export function FormLanguageSelector({
  label,
  selectedLanguages,
  onToggle,
  availableLanguages = ["es", "en"],
  extra,
  error,
}: FormLanguageSelectorProps) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="flex-row gap-4 items-center">
        <View className="flex-row gap-2">
          {availableLanguages.map((lang) => (
            <Pressable
              key={lang}
              className={`px-4 py-2 rounded-lg border ${
                selectedLanguages.includes(lang)
                  ? "bg-green-600 border-green-600"
                  : "bg-white border-gray-300"
              }`}
              onPress={() => onToggle(lang)}
            >
              <Text className={selectedLanguages.includes(lang) ? "text-white" : "text-gray-700"}>
                {lang.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        {extra && <View className="ml-auto">{extra}</View>}
      </View>
      {error && <Text className="text-red-500 text-xs mt-2">{error}</Text>}
    </View>
  );
}
