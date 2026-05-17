// Global Jest setup

// 1. Mock expo-router using our modular mock
// Note: We use require inside the factory to avoid out-of-scope errors during hoisting
jest.mock("expo-router", () => {
  const mocks = require("./src/mocks/expo-router.tsx");
  return {
    router: mocks.mockRouter,
    useRouter: mocks.useRouter,
    useLocalSearchParams: mocks.useLocalSearchParams,
    Link: mocks.Link,
    Tabs: mocks.Tabs,
    Stack: mocks.Stack,
    Slot: mocks.Slot,
    __mockRouter: mocks.mockRouter,
  };
});

// 2. Global test configuration
jest.setTimeout(10000);

// 3. Native module mocks
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en", languageTag: "en-US" }],
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => "MaterialCommunityIcons");
jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// 4. Project-specific component/hook mocks that should be global
// LanguageSwitcher is now tested with real component

// Global mock for translations since every screen uses it
// Enhanced to return useful values for accessibility testing while maintaining compatibility
jest.mock("./src/hooks/useI18n", () => ({
  useTranslations: () => ({
    // Return human-readable strings for common accessibility keys
    // but pass through most keys unchanged for existing tests
    t: (key: string) => {
      // Only translate specific accessibility-related keys
      const accessibilityKeys: Record<string, string> = {
        "common.select": "Select",
        "common.selected": "Selected",
        "common.language_selected": "Selected language",
        "common.switch_language": "Switch language",
        "common.switch_language_hint": "Tap to switch language",
        "common.language_active": "Currently active language",
        "form.supported_languages": "Supported Languages",
        "form.language.es": "ES language",
        "form.language.en": "EN language",
        "orders.today": "Today",
        "orders.tomorrow": "Tomorrow",
        "orders.choose": "Choose date",
        "orders.today_hint": "Select today's date",
        "orders.tomorrow_hint": "Select tomorrow's date",
        "orders.choose_hint": "Open date picker",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
      };

      // Return translated value if exact match, otherwise return key as-is
      if (accessibilityKeys[key]) {
        return accessibilityKeys[key];
      }
      return key; // Return original key for backward compatibility
    },
    locale: "en",
    getLocalizedName: (obj: Record<string, unknown> | undefined) => (obj?.en as string) || "",
  }),
  useLocale: () => ({
    locale: "en",
    setLocale: jest.fn(),
    initializeLocale: jest.fn(),
  }),
}));

// 5. Native hardware mocks
// Mock expo-haptics to prevent environment warnings (EXPO_OS undefined) during tests.
// Expo modules expect Babel to inline 'process.env.EXPO_OS' at build time, which
// doesn't happen during Jest execution. This also ensures haptic feedback
// logic doesn't crash in a generic Node environment.
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

// Mock nativewind CSS to avoid errors in tests
jest.mock("nativewind", () => ({}));
