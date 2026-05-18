import { Tabs } from "expo-router";
import { Icon } from "../../components/Icon";
import { useTranslations } from "../../hooks/useI18n";
import { SHARED_SCREEN_OPTIONS } from "../../constants/theme";

export default function AdminTabsLayout() {
  const { t } = useTranslations();

  return (
    <Tabs screenOptions={SHARED_SCREEN_OPTIONS}>
      <Tabs.Screen
        name="index"
        options={{
          href: "/admin",
          title: t("tabs.roles"),
          tabBarLabel: t("tabs.roles"),
          tabBarAccessibilityLabel: t("tabs.roles"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          href: "/admin/project",
          title: t("tabs.projects"),
          tabBarLabel: t("tabs.projects"),
          tabBarAccessibilityLabel: t("tabs.projects"),
          tabBarIcon: ({ color, size }) => <Icon name="folder" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/admin/profile",
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
          tabBarAccessibilityLabel: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <Icon name="account-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
