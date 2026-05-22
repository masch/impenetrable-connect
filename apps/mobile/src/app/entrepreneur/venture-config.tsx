import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";
import { useVentureStore } from "../../stores/venture.store";
import VentureCapacitySection from "../../components/VentureCapacitySection";
import VentureStatusSection from "../../components/VentureStatusSection";
import Screen, { ScreenContent } from "../../components/Screen";
import { Button } from "../../components/Button";
import { logger } from "../../services/logger.service";
import LoadingView from "../../components/LoadingView";

export default function VentureConfigScreen() {
  const { t } = useTranslations();
  const { currentUser } = useAuthStore();
  const {
    userVentures,
    selectedVenture,
    isLoading,
    fetchVenturesByUserId,
    updateVenture,
    setSelectedVenture,
  } = useVentureStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Draft state (dirty values before saving)
  const [draftIsPaused, setDraftIsPaused] = useState(selectedVenture?.zzz_is_paused ?? false);
  const [draftCapacity, setDraftCapacity] = useState(selectedVenture?.zzz_max_capacity ?? 0);

  useEffect(() => {
    if (currentUser?.id) {
      fetchVenturesByUserId(currentUser.id).finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, [currentUser?.id, fetchVenturesByUserId]);

  // Auto-select and init drafts when user ventures load and nothing is selected
  useEffect(() => {
    if (userVentures.length === 1 && !selectedVenture) {
      const venture = userVentures[0];
      setSelectedVenture(venture);
      setDraftIsPaused(venture.zzz_is_paused);
      setDraftCapacity(venture.zzz_max_capacity);
    }
  }, [userVentures, selectedVenture, setSelectedVenture]);

  const handleVentureSelect = (venture: (typeof userVentures)[number]) => {
    setSelectedVenture(venture);
    setDraftIsPaused(venture.zzz_is_paused);
    setDraftCapacity(venture.zzz_max_capacity);
  };

  const handleSave = async () => {
    if (!selectedVenture || isSaving) return;

    setIsSaving(true);
    try {
      const updated = await updateVenture(selectedVenture.id, {
        zzz_is_paused: draftIsPaused,
        zzz_max_capacity: draftCapacity,
      });
      if (updated) {
        logger.info(`Venture ${selectedVenture.id} configuration updated successfully`);
      }
    } catch (error) {
      logger.error("Error saving venture configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing || isLoading || !currentUser) return <LoadingView />;

  // Empty state
  if (userVentures.length === 0) {
    return (
      <Screen className="bg-background">
        <Stack.Screen
          options={{
            title: t("venture.config"),
            headerShadowVisible: false,
          }}
        />
        <ScreenContent>
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-on-surface-variant text-center font-body">
              {t("venture.no_ventures")}
            </Text>
          </View>
        </ScreenContent>
      </Screen>
    );
  }

  const isDirty =
    selectedVenture &&
    (draftIsPaused !== selectedVenture.zzz_is_paused ||
      draftCapacity !== selectedVenture.zzz_max_capacity);

  return (
    <Screen className="bg-background">
      <Stack.Screen
        options={{
          title: t("venture.config"),
          headerShadowVisible: false,
        }}
      />
      <ScreenContent>
        <ScrollView className="flex-1 px-4 py-6" contentContainerClassName="pb-28">
          {/* Venture Selector - only if more than 1 venture */}
          {userVentures.length > 1 && (
            <View className="mb-6">
              <Text className="text-sm font-display font-bold text-primary uppercase tracking-widest mb-2">
                {t("venture.select_venture")}
              </Text>
              {userVentures.map((v) => (
                <Button
                  key={v.id}
                  onPress={() => handleVentureSelect(v)}
                  variant="ghost"
                  className={`py-3 px-4 rounded-xl mb-2 ${
                    selectedVenture?.id === v.id ? "bg-primary" : "bg-surface-variant"
                  }`}
                  testID={`venture-selector-${v.id}`}
                  accessibilityLabel={v.name}
                >
                  <Text
                    className={`font-body ${
                      selectedVenture?.id === v.id ? "text-on-primary" : "text-on-surface"
                    }`}
                  >
                    {v.name}
                  </Text>
                </Button>
              ))}
            </View>
          )}

          <View className="mb-8">
            {!!selectedVenture?.name && (
              <Text className="text-sm font-display font-bold text-primary uppercase tracking-widest mb-1">
                {selectedVenture.name}
              </Text>
            )}
            <Text className="text-3xl font-display font-bold text-on-surface mb-2">
              {t("venture.config")}
            </Text>
            <Text className="text-on-surface-variant font-body">{t("venture.capacity_help")}</Text>
          </View>

          {selectedVenture && (
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
                originalCapacity={selectedVenture.zzz_max_capacity}
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
