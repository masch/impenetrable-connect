import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useProjectStore } from "../../stores/project.store";
import { useI18n } from "../../hooks/useI18n";
import { Project, Language, PROJECT_CONSTRAINTS, CreateProjectSchema } from "@repo/shared";
import { Button } from "../../components/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
import { FormInput } from "../../components/FormInput";
import { FormSwitch } from "../../components/FormSwitch";
import { FormLanguageSelector } from "../../components/FormLanguageSelector";
import Screen from "../../components/Screen";

interface ProjectFormData extends Omit<Project, "id"> {}

const initialFormData: ProjectFormData = {
  name: "",
  default_language: "es" as Language,
  supported_languages: ["es", "en"] as Language[],
  cascade_timeout_minutes: 30,
  max_cascade_attempts: 10,
  is_active: true,
};

export default function ProjectFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = id !== "new";

  const {
    selectedProject,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    isLoading,
    isSaving,
  } = useProjectStore();
  const { t } = useI18n();

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      selectProject(parseInt(id));
    }
  }, [isEditMode, id, selectProject]);

  useEffect(() => {
    if (isEditMode && selectedProject) {
      setFormData({
        name: selectedProject.name,
        default_language: selectedProject.default_language,
        supported_languages: [...selectedProject.supported_languages],
        cascade_timeout_minutes: selectedProject.cascade_timeout_minutes,
        max_cascade_attempts: selectedProject.max_cascade_attempts,
        is_active: selectedProject.is_active,
      });
    }
  }, [isEditMode, selectedProject]);

  const validateForm = (): boolean => {
    const result = CreateProjectSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const fieldName = issue.path.join(".");
        let message = issue.message;

        // Map Zod errors to i18n keys
        if (fieldName === "name") {
          if (issue.code === "too_small") {
            message = t("validation.name_min_length");
          } else if (issue.code === "too_big") {
            message = t("validation.name_max_length");
          } else if (issue.code === "invalid_type") {
            message = t("validation.name_required");
          }
        } else if (fieldName === "max_cascade_attempts") {
          if (issue.code === "too_small") {
            message = t("validation.max_attempts_min");
          } else if (issue.code === "too_big") {
            message = t("validation.max_attempts_max");
          } else if (issue.code === "invalid_type") {
            message = t("validation.max_attempts_required");
          }
        } else if (fieldName === "cascade_timeout_minutes") {
          if (issue.code === "too_small") {
            message = t("validation.timeout_min");
          } else if (issue.code === "too_big") {
            message = t("validation.timeout_max");
          } else if (issue.code === "invalid_type") {
            message = t("validation.timeout_required");
          }
        } else if (fieldName === "supported_languages") {
          message = t("validation.supported_languages_required");
        }

        errors[fieldName] = message;
      }

      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    if (isEditMode && id) {
      const result = await updateProject(parseInt(id), formData);
      if (result) {
        router.push("/");
      }
    } else {
      const result = await createProject(formData);
      if (result) {
        router.push("/");
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    const success = await deleteProject(parseInt(id!));
    if (success) {
      router.push("/");
    }
  };

  const toggleLanguage = (lang: Language) => {
    const current = formData.supported_languages;
    const newLanguages = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    setFormData({ ...formData, supported_languages: newLanguages });
  };

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="primary" accessibilityLabel="Loading" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 max-w-md w-full mx-auto px-5">
        <View className="mb-5">
          <Text className="text-2xl font-bold text-on-surface text-center">
            {isEditMode ? t("edit_project") : t("create_project")}
          </Text>
        </View>

        <FormInput
          label={t("project_name")}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder={t("project_name")}
          error={fieldErrors.name}
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormInput
              label={t("max_attempts")}
              value={formData.max_cascade_attempts.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, max_cascade_attempts: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              helperText={`${PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MIN}-${PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MAX}`}
              error={fieldErrors.max_cascade_attempts}
            />
          </View>
          <View className="flex-1">
            <FormInput
              label={t("cascade_timeout")}
              value={formData.cascade_timeout_minutes.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, cascade_timeout_minutes: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              helperText={`${PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MIN}-${PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MAX} min`}
              error={fieldErrors.cascade_timeout_minutes}
            />
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormLanguageSelector
              label={t("supported_languages")}
              selectedLanguages={formData.supported_languages}
              onToggle={toggleLanguage}
              error={fieldErrors.supported_languages}
            />
          </View>
          <View className="flex-1">
            <FormSwitch
              label={t("active")}
              value={formData.is_active}
              onValueChange={(value) => setFormData({ ...formData, is_active: value })}
            />
          </View>
        </View>

        <View className="mt-6 gap-3">
          <Button
            title={isSaving ? t("saving") : t("save")}
            variant="primary"
            disabled={isSaving}
            onPress={handleSave}
          />

          <Button title={t("cancel")} variant="secondary" onPress={() => router.push("/")} />

          {isEditMode && <Button title={t("delete")} variant="danger" onPress={handleDelete} />}
        </View>
      </View>

      <ConfirmModal
        visible={showDeleteModal}
        title={t("confirm_delete")}
        message={`${t("delete_confirm_message")} "${selectedProject?.name}"?`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        variant="danger"
        isLoading={isSaving}
      />
    </Screen>
  );
}
