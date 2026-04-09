import { useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";
import { useProjectStore } from "../../stores/project.store";
import { useI18n } from "../../hooks/useI18n";
import { useProjectSelectors } from "../../hooks/useProjectSelectors";
import { ProjectCard } from "../../components/project/ProjectCard";
import { Button } from "../../components/Button";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import Screen from "../../components/Screen";

export default function ProjectsScreen() {
  const router = useRouter();
  const { isLoading, error, fetchProjects } = useProjectStore();
  const { t } = useI18n();
  const { activeProjects, inactiveProjects } = useProjectSelectors();

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects]),
  );

  return (
    <Screen>
      <ScrollView
        className="flex-1 w-full self-center max-w-sm pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-on-surface font-display">
              {t("app_title")}
            </Text>
            <Text className="text-base text-on-surface mt-1 italic opacity-60">
              {t("mock_mode")}
            </Text>
          </View>
          <LanguageSwitcher />
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="primary" />
            <Text className="text-on-surface mt-4">{t("loading")}</Text>
          </View>
        )}

        {/* Active Projects */}
        {!isLoading && !error && activeProjects.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-bold text-on-surface mb-4">{t("active_projects")}</Text>
            <View className="items-center">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isActive={true} />
              ))}
            </View>
          </View>
        )}

        {/* Inactive Projects */}
        {!isLoading && !error && inactiveProjects.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-bold text-on-surface opacity-50 mb-4">
              {t("inactive_projects")}
            </Text>
            <View className="items-center">
              {inactiveProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isActive={false} />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && activeProjects.length === 0 && inactiveProjects.length === 0 && (
          <Text className="text-on-surface text-center mb-6 opacity-60">{t("no_projects")}</Text>
        )}

        {/* Action Button */}
        {!isLoading && (
          <View className="pt-8 pb-8">
            <Button
              title={t("add_project")}
              icon="+"
              onPress={() => router.push("/admin/project/new")}
            />
          </View>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </Screen>
  );
}
