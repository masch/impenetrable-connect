import { useAuthStore } from "../stores/auth.store";
import { View, Text, ScrollView } from "react-native";
import Screen, { ScreenContent } from "../components/Screen";
import { router } from "expo-router";
import { CreateUserInput, COLORS } from "@repo/shared";
import {
  DEMO_TOURIST_USERS,
  DEMO_ENTREPRENEUR_USERS,
  DEMO_ADMIN_USERS,
  type DemoUser,
} from "../mocks/users";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

import { Button } from "../components/Button";

// Role colors from design system - mapped for icons and backgrounds
const ROLE_COLORS = {
  TOURIST: {
    icon: COLORS["tertiary-container"],
    bgClass: "bg-tertiary-container",
    accentClass: "bg-tertiary-container/10",
    borderClass: "border-tertiary-container/30",
    textClass: "text-tertiary-container",
  },
  ENTREPRENEUR: {
    icon: COLORS.primary,
    bgClass: "bg-primary",
    accentClass: "bg-primary/10",
    borderClass: "border-primary/30",
    textClass: "text-primary",
  },
  ADMIN: {
    icon: COLORS.secondary,
    bgClass: "bg-secondary",
    accentClass: "bg-secondary/10",
    borderClass: "border-secondary/30",
    textClass: "text-secondary",
  },
} as const;

const ROLE_CONFIG = {
  TOURIST: {
    icon: "hiking",
    color: ROLE_COLORS.TOURIST.icon,
    bgClass: ROLE_COLORS.TOURIST.bgClass,
    accentClass: ROLE_COLORS.TOURIST.accentClass,
    borderClass: ROLE_COLORS.TOURIST.borderClass,
    textClass: ROLE_COLORS.TOURIST.textClass,
  },
  ENTREPRENEUR: {
    icon: "store",
    color: ROLE_COLORS.ENTREPRENEUR.icon,
    bgClass: ROLE_COLORS.ENTREPRENEUR.bgClass,
    accentClass: ROLE_COLORS.ENTREPRENEUR.accentClass,
    borderClass: ROLE_COLORS.ENTREPRENEUR.borderClass,
    textClass: ROLE_COLORS.ENTREPRENEUR.textClass,
  },
  ADMIN: {
    icon: "shield-account",
    color: ROLE_COLORS.ADMIN.icon,
    bgClass: ROLE_COLORS.ADMIN.bgClass,
    accentClass: ROLE_COLORS.ADMIN.accentClass,
    borderClass: ROLE_COLORS.ADMIN.borderClass,
    textClass: ROLE_COLORS.ADMIN.textClass,
  },
} as const;

// Role metadata moved to i18n

export default function RoleSelectorScreen() {
  const { setUserRole } = useAuthStore();
  const login = useAuthStore((state) => state.login);

  const handleDemoLogin = (user: DemoUser) => {
    const isTourist = user.role === "TOURIST";
    const userData: CreateUserInput = isTourist
      ? {
          alias: user.identifier,
          user_type: user.role,
          email: null,
          first_name: null,
          last_name: null,
          whatsapp: null,
        }
      : {
          alias: null,
          email: user.identifier,
          user_type: user.role,
          first_name: null,
          last_name: null,
          whatsapp: null,
        };

    login(userData);
    setUserRole(user.role);

    if (user.role === "TOURIST") {
      router.push("/tourist/catalog");
    } else if (user.role === "ENTREPRENEUR") {
      router.push("/entrepreneur/agenda");
    } else if (user.role === "ADMIN") {
      router.push("/admin/project");
    }
  };

  const handleTouristSignUp = () => {
    // Create a new tourist user with minimal data - will be filled in the form
    const newUserData: CreateUserInput = {
      alias: "",
      user_type: "TOURIST",
      email: null,
      first_name: null,
      last_name: null,
      whatsapp: null,
    };
    login(newUserData);
    setUserRole("TOURIST");
    router.push("/tourist/login");
  };

  const demoUsersByRole = [
    { role: "TOURIST" as const, users: DEMO_TOURIST_USERS },
    { role: "ENTREPRENEUR" as const, users: DEMO_ENTREPRENEUR_USERS },
    { role: "ADMIN" as const, users: DEMO_ADMIN_USERS },
  ] as const;

  const { t } = useTranslations();

  return (
    <Screen>
      <ScreenContent>
        <View className="flex-row justify-end mb-4">
          <LanguageSwitcher />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-display font-bold text-on-surface mb-2">
            {t("role_selector.welcome")}
          </Text>
          <Text className="text-base text-on-surface opacity-60 mb-8">
            {t("role_selector.subtitle")}
          </Text>

          {demoUsersByRole.map((group) => {
            const config = ROLE_CONFIG[group.role];
            const roleKey = group.role.toLowerCase();
            const label = t(`role_selector.roles.${roleKey}.label`);
            const description = t(`role_selector.roles.${roleKey}.description`);
            return (
              <View key={group.role} className="mb-6">
                {/* Role Header - Prominent styling */}
                <View
                  className={`flex-row items-center gap-3 p-3 rounded-lg ${config.accentClass} mb-3`}
                >
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center ${config.bgClass}`}
                  >
                    <MaterialCommunityIcons
                      name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color="on-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-display font-bold text-on-surface">{label}</Text>
                    <Text className="text-xs text-on-surface opacity-60">{description}</Text>
                  </View>
                </View>

                {/* Create Identity Button - Only for Tourists */}
                {group.role === "TOURIST" && (
                  <Button
                    variant="outline"
                    onPress={handleTouristSignUp}
                    leftIcon="plus-circle-outline"
                    title={t("role_selector.create_identity")}
                    subtitle={t("role_selector.register_as_tourist")}
                    className="mb-3"
                  />
                )}

                {/* Demo Users Grid */}
                <View className="flex flex-row flex-wrap gap-2">
                  {group.users.map((user) => (
                    <Button
                      key={user.identifier}
                      variant="secondary"
                      onPress={() => handleDemoLogin(user)}
                      leftIcon="account-outline"
                      rightIcon="chevron-right"
                      iconColor={config.color}
                      title={user.identifier.split("@")[0]}
                      className={`flex-1 min-w-[45%] border ${config.borderClass} bg-surface-container-low px-3 py-2.5 rounded-lg`}
                      accessibilityLabel={`Login as ${user.identifier.split("@")[0]}`}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
