import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import { SHARED_SCREEN_OPTIONS } from "../../constants/theme";

export default function TouristTabsLayout() {
  const { t } = useTranslations();

  return (
    <Tabs screenOptions={SHARED_SCREEN_OPTIONS}>
      <Tabs.Screen
        name="index"
        options={{
          href: "/tourist",
          title: t("tabs.roles"),
          tabBarLabel: t("tabs.roles"),
          tabBarAccessibilityLabel: t("tabs.roles"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: "/tourist/login",
          title: t("tabs.login"),
          tabBarLabel: t("tabs.login"),
          tabBarAccessibilityLabel: t("tabs.login"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="login" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          href: "/tourist/catalog",
          title: t("tabs.catalog"),
          tabBarLabel: t("tabs.catalog"),
          tabBarAccessibilityLabel: t("tabs.catalog"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: "/tourist/orders",
          title: t("tabs.orders"),
          tabBarLabel: t("tabs.orders"),
          tabBarAccessibilityLabel: t("tabs.orders"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/tourist/profile",
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
