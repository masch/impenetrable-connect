import { useEffect, useState, useMemo } from "react";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { UserRole } from "@repo/shared";
import { useAuthStore } from "../../stores/auth.store";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface TabItem {
  name: string;
  label: string;
  icon: IconName;
}

// Tabs organized by user role - keep this structure
const tabsByRole: Record<UserRole, TabItem[]> = {
  TOURIST: [
    { name: "role-selector", label: "Dev", icon: "wrench" },
    { name: "tourist/login", label: "Login", icon: "login" },
    { name: "tourist/catalog", label: "Catalog", icon: "view-grid" },
    { name: "tourist/order", label: "Order", icon: "cart" },
    { name: "profile", label: "Profile", icon: "account-circle" },
  ],
  ENTREPRENEUR: [
    { name: "role-selector", label: "Dev", icon: "wrench" },
    { name: "entrepreneur/request", label: "Request", icon: "file-document" },
    { name: "entrepreneur/agenda", label: "Agenda", icon: "calendar" },
    { name: "profile", label: "Profile", icon: "account-circle" },
  ],
  ADMIN: [
    { name: "role-selector", label: "Dev", icon: "wrench" },
    { name: "admin/project", label: "Projects", icon: "folder" },
    { name: "profile", label: "Profile", icon: "account-circle" },
  ],
};

export default function TabsLayout() {
  const userRole = useAuthStore((state) => state.userRole);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current role tabs
  const currentTabs = tabsByRole[userRole] ?? tabsByRole["TOURIST"];
  const currentTabNames = useMemo(() => currentTabs.map((t) => t.name), [currentTabs]);

  if (!mounted) {
    return null;
  }

  // Get unique tabs from all roles (deduplicate by name)
  const allTabs = Object.values(tabsByRole).flat();
  const uniqueTabs = allTabs.filter(
    (tab, index, self) => self.findIndex((t) => t.name === tab.name) === index,
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "primary",
        tabBarInactiveTintColor: "tab-inactive",
        tabBarStyle: { backgroundColor: "surface" },
        headerShown: false,
      }}
    >
      {uniqueTabs.map((tab) => {
        const isVisible = currentTabNames.includes(tab.name);

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarItemStyle: isVisible ? undefined : { display: "none" },
              title: tab.label,
              tabBarLabel: tab.label,
              tabBarIcon: ({ color, size }) => {
                // Cast to the expected icon type
                const iconName =
                  tab.icon as typeof MaterialCommunityIcons extends React.ComponentType<infer P>
                    ? P extends { name: infer N }
                      ? N
                      : never
                    : never;
                return (
                  <MaterialCommunityIcons name={iconName || "circle"} size={size} color={color} />
                );
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}
