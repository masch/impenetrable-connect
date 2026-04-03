import { useCallback } from "react";
import { useFocusEffect, useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator } from "react-native";
import { useProjectStore } from "../../stores/project.store";
import { useI18n, useLocale } from "../../hooks/useI18n";
import { Project } from "@repo/shared";
import { Button } from "../../components/Button";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useI18n();

  return (
    <Link href={`/projects/${project.id}`} className="block mb-3 w-full">
      <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm w-full">
        <Text className="text-lg font-bold text-gray-900 mb-2 text-center">{project.name}</Text>

        <View className="flex-row gap-2 mb-2 justify-center">
          <View className="bg-blue-100 px-2 py-1 rounded">
            <Text className="text-xs text-blue-700">
              {t("default_language")}: {project.default_language.toUpperCase()}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded ${project.is_active ? "bg-green-100" : "bg-gray-100"}`}
          >
            <Text className={`text-xs ${project.is_active ? "text-green-700" : "text-gray-500"}`}>
              {project.is_active ? "🟢 " + t("active") : "🔴 " + t("inactive")}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-2 mt-2">
          <Text className="text-xs text-gray-500 mb-1">
            {t("supported_languages")}:{" "}
            {project.supported_languages.map((l) => l.toUpperCase()).join(", ")}
          </Text>
          <View className="flex-row gap-4">
            <Text className="text-xs text-gray-500">
              ⏱️ {t("cascade_timeout")}: {project.cascade_timeout_minutes} min
            </Text>
            <Text className="text-xs text-gray-500">
              🔄 {t("max_attempts")}: {project.max_cascade_attempts}
            </Text>
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

  return (
    <View className="flex-1 bg-gray-50 pt-20 px-5">
      <View className="flex-1 max-w-md w-full mx-auto">
        <View className="mb-5 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900">{t("app_title")}</Text>
            <Text className="text-sm text-gray-500 italic">{t("mock_mode")}</Text>
          </View>
          <LanguageSwitcher />
        </View>

        {isLoading && (
          <View className="mb-5">
            <ActivityIndicator size="large" />
          </View>
        )}

        {error && (
          <View className="bg-red-100 p-4 rounded-lg mb-5">
            <Text className="text-red-700">
              {t("error")}: {error}
            </Text>
          </View>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <View className="w-full items-center mb-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <Text className="text-gray-500 text-center mb-5">{t("no_projects")}</Text>
        )}

        <View className="w-full">
          <Button title={t("add_project")} icon="+" onPress={() => router.push("/projects/new")} />
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
