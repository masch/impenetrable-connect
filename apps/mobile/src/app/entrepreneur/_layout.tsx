import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import { SHARED_SCREEN_OPTIONS } from "../../constants/theme";

export default function EntrepreneurTabsLayout() {
  const { t } = useTranslations();

  return (
    <Tabs screenOptions={SHARED_SCREEN_OPTIONS}>
      <Tabs.Screen
        name="index"
        options={{
          href: "/entrepreneur",
          title: t("tabs.roles"),
          tabBarLabel: t("tabs.roles"),
          tabBarAccessibilityLabel: t("tabs.roles"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          href: "/entrepreneur/request",
          title: t("tabs.request"),
          tabBarLabel: t("tabs.request"),
          tabBarAccessibilityLabel: t("tabs.request"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          href: "/entrepreneur/agenda",
          title: t("tabs.agenda"),
          tabBarLabel: t("tabs.agenda"),
          tabBarAccessibilityLabel: t("tabs.agenda"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/entrepreneur/profile",
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
          tabBarAccessibilityLabel: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
