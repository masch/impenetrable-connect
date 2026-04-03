import { Stack } from "expo-router";

export const DEFAULT_SCREEN_OPTIONS: React.ComponentProps<typeof Stack>["screenOptions"] = {
  headerShown: false,
  animation: "fade",
};
