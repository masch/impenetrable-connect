import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";
import VentureCapacitySection from "../../components/VentureCapacitySection";
import VentureStatusSection from "../../components/VentureStatusSection";
import Screen, { ScreenContent } from "../../components/Screen";
import { Button } from "../../components/Button";
import { logger } from "../../services/logger.service";

import LoadingView from "../../components/LoadingView";
import { VentureService } from "../../services/venture.service";
import { Venture } from "@repo/shared";

export default function VentureConfigScreen() {
  const { t } = useTranslations();
  const { currentUser } = useAuthStore();
  const [venture, setVenture] = useState<Venture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Draft state (dirty values before saving)
  const [draftIsPaused, setDraftIsPaused] = useState(false);
  const [draftCapacity, setDraftCapacity] = useState(0);

  useEffect(() => {
    async function load() {
      if (currentUser?.id) {
        try {
          const v = await VentureService.getVentureByUserId(currentUser.id);
          if (v) {
            setVenture(v);
            setDraftIsPaused(v.zzz_is_paused);
            setDraftCapacity(v.zzz_max_capacity);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    load();
  }, [currentUser?.id]);

  const handleSave = async () => {
    if (!venture || isSaving) return;

    setIsSaving(true);
    try {
      const updated = await VentureService.updateVenture(venture.id, {
        zzz_is_paused: draftIsPaused,
        zzz_max_capacity: draftCapacity,
      });
      setVenture(updated);
      logger.info(`Venture ${venture.id} configuration updated successfully`);
    } catch (error) {
      logger.error("Error saving venture configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !currentUser) return <LoadingView />;

  const isDirty =
    venture &&
    (draftIsPaused !== venture.zzz_is_paused || draftCapacity !== venture.zzz_max_capacity);

  return (
    <Screen className="bg-background">
      <Stack.Screen
        options={{
          title: t("venture.config"),
          headerShadowVisible: false,
        }}
      />
      <ScreenContent>
        <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mb-8">
            {!!venture?.name && (
              <Text className="text-sm font-display font-bold text-primary uppercase tracking-[2px] mb-1">
                {venture.name}
              </Text>
            )}
            <Text className="text-3xl font-display font-bold text-on-surface mb-2">
              {t("venture.config")}
            </Text>
            <Text className="text-on-surface-variant font-body">{t("venture.capacity_help")}</Text>
          </View>

          {venture && (
            <>
              <VentureStatusSection
                isPaused={draftIsPaused}
                onValueChange={setDraftIsPaused}
                disabled={isSaving}
              />
              <VentureCapacitySection
                capacity={draftCapacity}
                onValueChange={setDraftCapacity}
                disabled={isSaving}
                originalCapacity={venture.zzz_max_capacity}
              />

              <View className="mt-4">
                <Button
                  onPress={handleSave}
                  disabled={!isDirty || isSaving}
                  isLoading={isSaving}
                  variant="primary"
                  className="rounded-2xl shadow-md h-14"
                  testID="save-button"
                >
                  <Text className="text-on-primary font-bold text-lg">{t("common.save")}</Text>
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
