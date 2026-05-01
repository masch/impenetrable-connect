import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";
import VentureCapacitySection from "../../components/VentureCapacitySection";
import Screen, { ScreenContent } from "../../components/Screen";

import LoadingView from "../../components/LoadingView";
import { VentureService } from "../../services/venture.service";

export default function VentureConfigScreen() {
  const { t } = useTranslations();
  const { currentUser } = useAuthStore();
  const [ventureName, setVentureName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (currentUser?.id) {
        try {
          const v = await VentureService.getVentureByUserId(currentUser.id);
          if (v) setVentureName(v.name);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    load();
  }, [currentUser?.id]);

  if (isLoading || !currentUser) return <LoadingView />;

  return (
    <Screen className="bg-background">
      <Stack.Screen
        options={{
          title: t("venture.config"),
          headerShadowVisible: false,
        }}
      />
      <ScreenContent>
        <ScrollView className="flex-1 px-4 py-6">
          <View className="mb-8">
            {!!ventureName && (
              <Text className="text-sm font-display font-bold text-primary uppercase tracking-[2px] mb-1">
                {ventureName}
              </Text>
            )}
            <Text className="text-3xl font-display font-bold text-on-surface mb-2">
              {t("venture.config")}
            </Text>
            <Text className="text-on-surface-variant font-body">{t("venture.capacity_help")}</Text>
          </View>

          <VentureCapacitySection userId={currentUser.id} />
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
