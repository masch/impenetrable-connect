import { useCallback } from "react";
import { useFocusEffect, useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";
import { useProjectStore } from "../../../stores/project.store";
import { useI18n } from "../../../hooks/useI18n";
import { Project } from "@repo/shared";
import { Button } from "../../../components/Button";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

interface ProjectCardProps {
  project: Project;
}

function ActiveProjectCard({ project }: ProjectCardProps) {
  const { t } = useI18n();

  return (
    <Link href={`/projects/${project.id}`} className="block mb-6 w-full">
      <View className="bg-surface-container-highest p-6 w-full">
        {/* Header - Project Name + Status */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-on-surface font-display text-center">
            {project.name}
          </Text>
          <View className="flex-row justify-center mt-2">
            <View className="bg-secondary-container px-4 py-1">
              <Text className="text-sm font-medium text-on-secondary-fixed">● {t("active")}</Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View className="gap-3">
          {/* Default Language */}
          <View className="bg-surface-container-low p-3 flex-row justify-between">
            <Text className="text-sm text-on-surface opacity-70">{t("default_language")}</Text>
            <Text className="text-sm font-medium text-on-surface">
              {project.default_language.toUpperCase()}
            </Text>
          </View>

          {/* Supported Languages */}
          <View className="bg-surface-container-low p-3 flex-row justify-between">
            <Text className="text-sm text-on-surface opacity-70">{t("supported_languages")}</Text>
            <Text className="text-sm font-medium text-on-surface">
              {project.supported_languages.map((l) => l.toUpperCase()).join(", ")}
            </Text>
          </View>

          {/* Configuration Row */}
          <View className="flex-row gap-3">
            <View className="bg-surface-container-low flex-1 p-3">
              <Text className="text-xs text-on-surface opacity-50 mb-1">
                {t("cascade_timeout")}
              </Text>
              <Text className="text-base font-medium text-on-surface">
                {project.cascade_timeout_minutes} min
              </Text>
            </View>
            <View className="bg-surface-container-low flex-1 p-3">
              <Text className="text-xs text-on-surface opacity-50 mb-1">{t("max_attempts")}</Text>
              <Text className="text-base font-medium text-on-surface">
                {project.max_cascade_attempts}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );
}

function InactiveProjectCard({ project }: ProjectCardProps) {
  const { t } = useI18n();

  return (
    <Link href={`/projects/${project.id}`} className="block mb-6 w-full">
      <View className="bg-surface-container-low p-6 w-full">
        {/* Header - Project Name + Status */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-on-surface opacity-40 font-display text-center">
            {project.name}
          </Text>
          <View className="flex-row justify-center mt-2">
            <View className="bg-surface px-4 py-1">
              <Text className="text-sm font-medium text-on-surface opacity-40">
                ○ {t("inactive")}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Grid - Reduced opacity */}
        <View className="gap-3">
          {/* Default Language */}
          <View className="bg-surface p-3 flex-row justify-between">
            <Text className="text-sm text-on-surface opacity-40">{t("default_language")}</Text>
            <Text className="text-sm font-medium text-on-surface opacity-40">
              {project.default_language.toUpperCase()}
            </Text>
          </View>

          {/* Supported Languages */}
          <View className="bg-surface p-3 flex-row justify-between">
            <Text className="text-sm text-on-surface opacity-40">{t("supported_languages")}</Text>
            <Text className="text-sm font-medium text-on-surface opacity-40">
              {project.supported_languages.map((l) => l.toUpperCase()).join(", ")}
            </Text>
          </View>

          {/* Configuration Row */}
          <View className="flex-row gap-3">
            <View className="bg-surface flex-1 p-3">
              <Text className="text-xs text-on-surface opacity-30 mb-1">
                {t("cascade_timeout")}
              </Text>
              <Text className="text-base font-medium text-on-surface opacity-40">
                {project.cascade_timeout_minutes} min
              </Text>
            </View>
            <View className="bg-surface flex-1 p-3">
              <Text className="text-xs text-on-surface opacity-30 mb-1">{t("max_attempts")}</Text>
              <Text className="text-base font-medium text-on-surface opacity-40">
                {project.max_cascade_attempts}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  const { t } = useI18n();

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects]),
  );

  // Sort: active first, then by name (ascending)
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const activeProjects = sortedProjects.filter((p) => p.is_active);
  const inactiveProjects = sortedProjects.filter((p) => !p.is_active);

  return (
    <View className="flex-1 bg-surface pt-20 px-5">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          maxWidth: 448,
          width: "100%",
          alignSelf: "center",
          paddingBottom: 24,
        }}
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
            <ActivityIndicator size="large" color="#2b868c" />
            <Text className="text-on-surface mt-4">{t("loading")}</Text>
          </View>
        )}

        {/* Active Projects */}
        {!isLoading && !error && activeProjects.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-bold text-on-surface mb-4">{t("active_projects")}</Text>
            <View className="items-center">
              {activeProjects.map((project) => (
                <ActiveProjectCard key={project.id} project={project} />
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
                <InactiveProjectCard key={project.id} project={project} />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <Text className="text-on-surface text-center mb-6 opacity-60">{t("no_projects")}</Text>
        )}

        {/* Action Button */}
        {!isLoading && (
          <View className="pt-8 pb-8">
            <Button
              title={t("add_project")}
              icon="+"
              onPress={() => router.push("/projects/new")}
            />
          </View>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}
