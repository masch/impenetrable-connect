import { useAuthStore } from "../../stores/auth.store";
import { UserRole } from "@repo/shared";
import { Button } from "../../components/Button";
import { View, Text } from "react-native";
import Screen, { ScreenContent } from "../../components/Screen";

const ROLES: { role: UserRole; label: string; description: string }[] = [
  {
    role: "TOURIST",
    label: "Tourist",
    description: "Browse catalog and place orders",
  },
  {
    role: "ENTREPRENEUR",
    label: "Entrepreneur",
    description: "Manage requests and agenda",
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Manage projects",
  },
];

export default function RoleSelectorScreen() {
  const { userRole, setUserRole } = useAuthStore();

  return (
    <Screen>
      <ScreenContent>
        <Text className="text-2xl font-bold text-on-surface mb-1">Select User Role</Text>
        <Text className="text-sm text-on-surface opacity-60 mb-6">Development mode only</Text>

        <View className="mb-6">
          {ROLES.map((item) => (
            <View key={item.role} className="mb-4">
              <Button
                title={item.label}
                variant={userRole === item.role ? "primary" : "secondary"}
                onPress={() => setUserRole(item.role)}
              />
              <Text className="text-xs text-on-surface opacity-60 mt-1">{item.description}</Text>
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
