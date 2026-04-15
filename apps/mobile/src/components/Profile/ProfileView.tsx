import { UserRole } from "@repo/shared";
import { Text } from "react-native";
import Screen from "../Screen";

interface ProfileViewProps {
  userType: UserRole;
}

/**
 * Shared Profile View component.
 * Uses role-based context and shared monorepo types.
 */
export default function ProfileView({ userType }: ProfileViewProps) {
  return (
    <Screen>
      <Text>Profile - {userType}</Text>
    </Screen>
  );
}
