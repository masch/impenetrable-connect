import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useI18n } from "../../hooks/useI18n";

export default function EntrepreneurTabsLayout() {
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
        name="request"
        options={{
          title: t("tabs.request"),
          tabBarLabel: t("tabs.request"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: t("tabs.agenda"),
          tabBarLabel: t("tabs.agenda"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
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
