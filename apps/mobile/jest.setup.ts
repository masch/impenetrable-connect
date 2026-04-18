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
jest.mock("./src/components/LanguageSwitcher", () => ({
  LanguageSwitcher: () => null,
}));

// Global mock for translations since every screen uses it
jest.mock("./src/hooks/useI18n", () => ({
  useTranslations: () => ({
    t: (key: string) => key,
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
