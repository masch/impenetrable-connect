import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useI18n } from "../../hooks/useI18n";

export default function TouristTabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "primary",
        tabBarInactiveTintColor: "tab-inactive",
        tabBarStyle: { backgroundColor: "surface" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: "/",
          title: t("tabs.roles"),
          tabBarLabel: t("tabs.roles"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="common/role-selector"
        options={{
          title: t("tabs.dev"),
          tabBarLabel: t("tabs.dev"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wrench" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: t("tabs.login"),
          tabBarLabel: t("tabs.login"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="login" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: t("tabs.catalog"),
          tabBarLabel: t("tabs.catalog"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: t("tabs.order"),
          tabBarLabel: t("tabs.order"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="common/profile"
        options={{
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
