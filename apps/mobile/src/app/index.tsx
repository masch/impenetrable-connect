import { useAuthStore } from "../stores/auth.store";
import { Button } from "../components/Button";
import { View, Text } from "react-native";
import Screen, { ScreenContent } from "../components/Screen";
import { router } from "expo-router";
import { ROLES, ROLE_CONFIG } from "../constants/roles";
import { useI18n } from "../hooks/useI18n";

export default function RoleSelectorScreen() {
  const { userRole, setUserRole } = useAuthStore();
  const { t } = useI18n();

  const handleRoleSelect = (role: (typeof ROLES)[number]["role"]) => {
    setUserRole(role);
    router.replace(ROLE_CONFIG[role].landingPage);
  };

  return (
    <Screen>
      <ScreenContent>
        <Text className="text-2xl font-bold text-on-surface mb-1">Select User Role</Text>
        <Text className="text-sm text-on-surface opacity-60 mb-6">Development mode only</Text>

        <View className="mb-6">
          {ROLES.map((item) => (
            <View key={item.role} className="mb-4">
              <Button
                title={t(item.labelKey)}
                variant={userRole === item.role ? "primary" : "secondary"}
                onPress={() => handleRoleSelect(item.role)}
              />
              <Text className="text-xs text-on-surface opacity-60 mt-1">
                {t(item.descriptionKey)}
              </Text>
            </View>
          ))}
        </View>

        <View className="p-4 bg-surface-container-lowest rounded-none flex-row justify-between">
          <Text className="text-on-surface opacity-60">Current role:</Text>
          <Text className="font-bold text-on-surface">{userRole}</Text>
        </View>
      </ScreenContent>
    </Screen>
  );
}
