import { ConfigContext, ExpoConfig } from "expo/config";

// App configuration
const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "org.impenetrable.connect.dev";
  }

  if (IS_PREVIEW) {
    return "org.impenetrable.connect.preview";
  }

  return "org.impenetrable.connect";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Impenetrable Connect (Dev)";
  }

  if (IS_PREVIEW) {
    return "Impenetrable Connect (Preview)";
  }

  return "Impenetrable Connect";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "impenetrable-connect",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "impenetrable-connect",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#fcf9f2", // Uses surface color from design system
  },
  plugins: ["expo-localization", "expo-router", "@react-native-community/datetimepicker"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#fcf9f2",
    },
    predictiveBackGestureEnabled: false,
    package: getUniqueIdentifier(),
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  extra: {
    router: {},
    eas: {
      projectId: "430a65eb-19e4-4158-9822-475364cb6664",
    },
  },
  owner: "masch",
});
