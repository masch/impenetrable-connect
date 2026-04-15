import { COLORS } from "@repo/shared";

export const SHARED_SCREEN_OPTIONS = {
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS["tab-inactive"],
  tabBarStyle: { backgroundColor: COLORS.surface },
  headerShown: false,
} as const;
