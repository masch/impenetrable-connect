import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Icon } from "../../components/Icon";
import { useTranslations } from "../../hooks/useI18n";
import { SHARED_SCREEN_OPTIONS } from "../../constants/theme";
import { useAgendaStore } from "../../stores/agenda.store";

export default function EntrepreneurTabsLayout() {
  const { t } = useTranslations();
  const { pendingOrders, fetchPendingOrders } = useAgendaStore();
  const pendingCount = pendingOrders.length;

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

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
            <Icon name="swap-horizontal" size={size} color={color} />
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
          tabBarIcon: ({ color, size }) => <Icon name="file-document" size={size} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          href: "/entrepreneur/agenda",
          title: t("tabs.agenda"),
          tabBarLabel: t("tabs.agenda"),
          tabBarAccessibilityLabel: t("tabs.agenda"),
          tabBarIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/entrepreneur/profile",
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
          tabBarAccessibilityLabel: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <Icon name="account-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="venture-config"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
