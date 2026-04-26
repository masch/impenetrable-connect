import { useAuthStore } from "../stores/auth.store";
import { View, Text, ScrollView } from "react-native";
import Screen, { ScreenContent } from "../components/Screen";
import { router } from "expo-router";
import { MOCK_VENTURES, UserRole, type User, COLORS } from "@repo/shared";
import { MOCK_VENTURE_MEMBERS } from "../mocks/venture-members.data";
import { getDemoUsersByRole, findUserById } from "../mocks/users";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

import { Button } from "../components/Button";
import { formatUserDisplayName } from "../logic/formatters";
import env from "../config/env";
import { logger } from "../services/logger.service";
import { getMockOrders } from "../mocks/orders";

interface RoleConfig {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bgClass: string;
  accentClass: string;
  borderClass: string;
  textClass: string;
  color: string;
  titleKey: string;
  descriptionKey: string;
  userIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  actionTitleKey?: string;
  actionDescriptionKey?: string;
  actionIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

// Role configuration from design system - mapped for icons and backgrounds
const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.TOURIST]: {
    icon: "map-marker-radius",
    bgClass: "bg-tertiary-container",
    accentClass: "bg-tertiary-container/10",
    borderClass: "border-tertiary-container/30",
    textClass: "text-tertiary-container",
    color: COLORS["tertiary-container"],
    titleKey: "role_selector.roles.TOURIST.label",
    descriptionKey: "role_selector.roles.TOURIST.description",
    userIcon: "account-outline",
    actionTitleKey: "role_selector.create_identity",
    actionDescriptionKey: "role_selector.register_as_tourist",
    actionIcon: "account-plus-outline",
  },
  [UserRole.ENTREPRENEUR]: {
    icon: "storefront",
    bgClass: "bg-primary",
    accentClass: "bg-primary/10",
    borderClass: "border-primary/30",
    textClass: "text-primary",
    color: COLORS.primary,
    titleKey: "role_selector.roles.ENTREPRENEUR.label",
    descriptionKey: "role_selector.roles.ENTREPRENEUR.description",
    userIcon: "account-tie-outline",
    actionTitleKey: "role_selector.register_parador",
    actionDescriptionKey: "role_selector.apply_new_venture",
    actionIcon: "store-plus-outline",
  },
  [UserRole.ADMIN]: {
    icon: "shield-check",
    bgClass: "bg-secondary",
    accentClass: "bg-secondary/10",
    borderClass: "border-secondary/30",
    textClass: "text-secondary",
    color: COLORS.secondary,
    titleKey: "role_selector.roles.ADMIN.label",
    descriptionKey: "role_selector.roles.ADMIN.description",
  },
};

export default function RoleSelectorScreen() {
  logger.debug("env.USE_MOCKS", { value: env.USE_MOCKS });
  logger.debug("EXPO_PUBLIC_USE_MOCKS", { value: process.env.EXPO_PUBLIC_USE_MOCKS });
  const { setUserRole } = useAuthStore();
  const login = useAuthStore((state) => state.login);

  const getUserIdentifier = (user: User, role: UserRole): string => {
    if (role === UserRole.TOURIST) {
      return user.alias || user.firstName || "Tourist";
    }
    return user.email || "";
  };

  const handleDemoLogin = async (user: User) => {
    const role = user.role;
    const isTourist = role === "TOURIST";

    try {
      // Clear previous session state before new demo login
      await useAuthStore.getState().logout();

      if (isTourist) {
        await login({ alias: user.alias! });
      } else {
        await login({ email: user.email!, password: "password123" });
      }

      setUserRole(role);

      if (role === UserRole.TOURIST) {
        router.replace("/tourist");
      } else if (role === UserRole.ENTREPRENEUR) {
        // Smart routing: check for pending orders before deciding where to go
        const pendingOrders = getMockOrders(user.id).filter(
          (o) => o.zzz_global_status === "OFFER_PENDING",
        );

        if (pendingOrders.length > 0) {
          router.replace("/entrepreneur/request");
        } else {
          router.replace("/entrepreneur/agenda");
        }
      } else if (role === UserRole.ADMIN) {
        router.replace("/admin/project");
      }
    } catch (error) {
      logger.error("Demo login failed", error as Error);
    }
  };

  const handleTouristSignUp = () => {
    setUserRole(UserRole.TOURIST);
    router.push("/tourist/login");
  };

  const demoUsersByRole = [
    { role: UserRole.TOURIST, users: env.USE_MOCKS ? getDemoUsersByRole(UserRole.TOURIST) : [] },
    {
      role: UserRole.ENTREPRENEUR,
      users: env.USE_MOCKS ? getDemoUsersByRole(UserRole.ENTREPRENEUR) : [],
    },
    { role: UserRole.ADMIN, users: env.USE_MOCKS ? getDemoUsersByRole(UserRole.ADMIN) : [] },
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
                      color={COLORS["on-primary"]}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-display font-bold text-on-surface">
                      {t(config.titleKey)}
                    </Text>
                    <Text className="text-on-surface opacity-60 text-xs">
                      {t(config.descriptionKey)}
                    </Text>
                  </View>
                </View>

                {/* Section Primary Action (Mock) - Only for Tourists */}
                {env.USE_MOCKS && group.role === UserRole.TOURIST ? (
                  <Button
                    variant="outline"
                    onPress={handleTouristSignUp}
                    leftIcon={config.actionIcon}
                    title={t(config.actionTitleKey || "")}
                    subtitle={t(config.actionDescriptionKey || "")}
                    className={`mb-4 border ${config.borderClass}`}
                  />
                ) : (
                  // Spacer to maintain vertical rhythm when action button is hidden (match mb-4)
                  <View className="h-4" />
                )}

                {/* Real Login Button - For Entrepreneur and Admin in Real Mode */}
                {!env.USE_MOCKS &&
                  (group.role === UserRole.ENTREPRENEUR || group.role === UserRole.ADMIN) && (
                    <Button
                      variant="primary"
                      onPress={() => {
                        setUserRole(group.role);
                        router.push("/auth/login");
                      }}
                      leftIcon="login"
                      title={t("common.login")}
                      className="mb-3"
                    />
                  )}

                {env.USE_MOCKS && (
                  <View className="flex-col gap-2">
                    {group.role === UserRole.ENTREPRENEUR ? (
                      <View className="flex-col gap-2">
                        {MOCK_VENTURES.map((venture) => {
                          const members = MOCK_VENTURE_MEMBERS.filter(
                            (m) => m.ventureId === venture.id,
                          );
                          if (members.length === 0) return null;

                          return (
                            <View
                              key={venture.id}
                              className="w-full bg-primary/5 p-3 rounded-2xl border border-primary/10"
                            >
                              <View className="flex-row items-center mb-3">
                                <View className="bg-primary/10 p-1.5 rounded-lg">
                                  <MaterialCommunityIcons
                                    name="storefront"
                                    size={16}
                                    color={COLORS.primary}
                                  />
                                </View>
                                <Text className="text-sm font-bold text-primary ml-2 tracking-tight">
                                  {venture.name}
                                </Text>
                              </View>

                              <View className="flex flex-row flex-wrap gap-2">
                                {members.map((member) => {
                                  const user = findUserById(member.userId);
                                  if (!user) return null;

                                  return (
                                    <Button
                                      key={user.id}
                                      variant="ghost"
                                      onPress={() => handleDemoLogin(user)}
                                      leftIcon={config.userIcon}
                                      title={formatUserDisplayName(
                                        user.firstName || user.email || "",
                                      )}
                                      className={`flex-1 min-w-[45%] border ${config.borderClass} bg-white/60 px-3 py-2.5 rounded-xl`}
                                      textClassName={config.textClass}
                                      iconColor={COLORS.primary}
                                    />
                                  );
                                })}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <View className="flex flex-row flex-wrap gap-2">
                        {group.users.map((user) => {
                          const identifier = getUserIdentifier(user, group.role);
                          const displayName = formatUserDisplayName(identifier);

                          return (
                            <Button
                              key={user.id}
                              variant="ghost"
                              onPress={() => handleDemoLogin(user)}
                              leftIcon={config.userIcon}
                              title={displayName}
                              className={`flex-1 min-w-[45%] border ${config.borderClass} ${config.accentClass} px-3 py-2.5 rounded-lg`}
                              textClassName={config.textClass}
                              iconColor={
                                group.role === UserRole.ADMIN
                                  ? COLORS.secondary
                                  : COLORS["tertiary-container"]
                              }
                            />
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
