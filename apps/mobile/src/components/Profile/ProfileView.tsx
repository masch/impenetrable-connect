import { UserRole, COLORS, User } from "@repo/shared";
import { Text, View } from "react-native";
import { useRouter, Router } from "expo-router";
import { Icon } from "../Icon";
import Screen, { ScreenContent } from "../Screen";
import { Button } from "../Button";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";

interface ProfileViewProps {
  userType: UserRole;
}

interface ProfileAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

interface ProfileSection {
  title: string;
  actions: ProfileAction[];
}

interface ConfigParams {
  t: (key: string) => string;
  router: Router;
  currentUser: User | null;
}

const ROLE_CONFIGS: Partial<Record<UserRole, (params: ConfigParams) => ProfileSection[]>> = {
  [UserRole.ENTREPRENEUR]: ({ t, router, currentUser }) =>
    currentUser?.id
      ? [
          {
            title: t("tabs.venture"),
            actions: [
              {
                id: "venture-config",
                title: t("venture.config"),
                description: t("venture.capacity_help"),
                icon: "store-cog",
                onPress: () => router.push("/entrepreneur/venture-config"),
              },
            ],
          },
        ]
      : [],
  [UserRole.ADMIN]: ({ t, router }) => [
    {
      title: t("admin.system"),
      actions: [
        {
          id: "system-status",
          title: t("status.title"),
          description: `${t("status.services")} & ${t("status.pipelines")}`,
          icon: "pulse",
          onPress: () => router.push("/system-status"),
        },
      ],
    },
  ],
};

export default function ProfileView({ userType }: ProfileViewProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const sections = ROLE_CONFIGS[userType]?.({ t, router, currentUser }) || [];

  return (
    <Screen>
      <ScreenContent className="p-4">
        <Text className="text-2xl font-display font-bold text-on-surface mb-8">
          {t("profile.title")}
        </Text>

        {sections.map((section) => (
          <View key={section.title} className="mb-8">
            <Text className="text-xs font-display font-bold text-primary uppercase tracking-[2px] mb-4 ml-1">
              {section.title}
            </Text>
            {section.actions.map((action) => (
              <ProfileActionButton key={action.id} {...action} />
            ))}
          </View>
        ))}
      </ScreenContent>
    </Screen>
  );
}

function ProfileActionButton({ title, description, icon, onPress }: ProfileAction) {
  const { t } = useTranslations();

  return (
    <Button
      onPress={onPress}
      variant="ghost"
      className="flex-row items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30"
      testID={`profile-action-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <View className="size-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
        <Icon name={icon} size={24} color={COLORS.primary} accessibilityLabel={title} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-display font-bold text-on-surface">{title}</Text>
        <Text className="text-sm font-body text-on-surface-variant/70">{description}</Text>
      </View>
      <Icon
        name="chevron-right"
        size={24}
        color={COLORS["on-surface-variant"]}
        accessibilityLabel={t("common.more")}
      />
    </Button>
  );
}
