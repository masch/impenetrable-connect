import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Project } from "@repo/shared";
import { useI18n } from "../../hooks/useI18n";

/**
 * Props for the ProjectCard component
 */
interface ProjectCardProps {
  project: Project;
  isActive: boolean;
}

/**
 * Unified ProjectCard component that handles both active and inactive project display
 * @param project - The project data to display
 * @param isActive - Whether the project is active (affects styling)
 */
export function ProjectCard({ project, isActive }: ProjectCardProps) {
  const { t } = useI18n();

  // Active project uses high contrast styling
  const containerClass = isActive
    ? "bg-surface-container-highest p-6"
    : "bg-surface-container-low p-6";

  // Active project uses full opacity, inactive uses reduced opacity
  const textOpacity = isActive ? "opacity-100" : "opacity-40";
  const secondaryOpacity = isActive ? "opacity-70" : "opacity-40";
  const tertiaryOpacity = isActive ? "opacity-50" : "opacity-30";

  // Active: filled secondary container, Inactive: surface with lower opacity
  const statusBadgeClass = isActive ? "bg-secondary-container px-4 py-1" : "bg-surface px-4 py-1";

  const statusDot = isActive ? "●" : "○";
  const statusText = isActive ? t("active") : t("inactive");

  return (
    <Link href={`/admin/project/${project.id}`} className="block mb-6 w-full">
      <View className={`${containerClass} w-full`}>
        {/* Header - Project Name + Status */}
        <View className="mb-4">
          <Text
            className={`text-2xl font-bold text-on-surface font-display text-center ${textOpacity}`}
          >
            {project.name}
          </Text>
          <View className="flex-row justify-center mt-2">
            <View className={statusBadgeClass}>
              <Text className={`text-sm font-medium text-on-surface ${secondaryOpacity}`}>
                {statusDot} {statusText}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View className="gap-3">
          {/* Default Language */}
          <View className="bg-surface-container-low p-3 flex-row justify-between">
            <Text className={`text-sm text-on-surface ${secondaryOpacity}`}>
              {t("default_language")}
            </Text>
            <Text className={`text-sm font-medium text-on-surface ${textOpacity}`}>
              {project.default_language.toUpperCase()}
            </Text>
          </View>

          {/* Supported Languages */}
          <View className="bg-surface-container-low p-3 flex-row justify-between">
            <Text className={`text-sm text-on-surface ${secondaryOpacity}`}>
              {t("supported_languages")}
            </Text>
            <Text className={`text-sm font-medium text-on-surface ${textOpacity}`}>
              {project.supported_languages.map((l) => l.toUpperCase()).join(", ")}
            </Text>
          </View>

          {/* Configuration Row */}
          <View className="flex-row gap-3">
            <View className="bg-surface-container-low flex-1 p-3">
              <Text className={`text-xs text-on-surface ${tertiaryOpacity} mb-1`}>
                {t("cascade_timeout")}
              </Text>
              <Text className={`text-base font-medium text-on-surface ${textOpacity}`}>
                {project.cascade_timeout_minutes} min
              </Text>
            </View>
            <View className="bg-surface-container-low flex-1 p-3">
              <Text className={`text-xs text-on-surface ${tertiaryOpacity} mb-1`}>
                {t("max_attempts")}
              </Text>
              <Text className={`text-base font-medium text-on-surface ${textOpacity}`}>
                {project.max_cascade_attempts}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );
}
