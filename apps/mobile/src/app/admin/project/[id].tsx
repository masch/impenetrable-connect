import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useProjectStore } from "../../../stores/project.store";
import { useTranslations } from "../../../hooks/useI18n";
import {
  Language,
  SUPPORTED_LANGUAGES,
  CreateProjectSchema,
  UpdateProjectSchema,
  PROJECT_CONSTRAINTS,
} from "@repo/shared";
import { logger } from "../../../services/logger.service";
import { FormInput } from "../../../components/FormInput";
import { FormLanguageSelector } from "../../../components/FormLanguageSelector";
import { FormSwitch } from "../../../components/FormSwitch";
import { Button } from "../../../components/Button";
import Screen from "../../../components/Screen";
import LoadingView from "../../../components/LoadingView";
import { AppAlert } from "../../../components/AppAlert";
import { ComponentProps } from "react";

const AVAILABLE_LANGUAGES = SUPPORTED_LANGUAGES;
const RADIX_DECIMAL = 10;

interface FormData {
  zzz_name: string;
  zzz_default_language: Language;
  zzz_supported_languages: Language[];
  zzz_cascade_timeout_minutes: string;
  zzz_max_cascade_attempts: string;
  zzz_is_active: boolean;
  zzz_timezone: string;
}

interface FormErrors {
  zzz_name?: string;
  zzz_supported_languages?: string;
  zzz_cascade_timeout_minutes?: string;
  zzz_max_cascade_attempts?: string;
  zzz_timezone?: string;
}

const initialFormData: FormData = {
  zzz_name: "",
  zzz_default_language: "es",
  zzz_supported_languages: ["es"],
  zzz_cascade_timeout_minutes: String(PROJECT_CONSTRAINTS.CASCADE_TIMEOUT_MINUTES_MAX),
  zzz_max_cascade_attempts: String(PROJECT_CONSTRAINTS.MAX_CASCADE_ATTEMPTS_MAX),
  zzz_is_active: true,
  zzz_timezone: "America/Argentina/Buenos_Aires",
};

export default function ProjectFormScreen() {
  const { replace, back } = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = id !== undefined && id !== "new";

  const { t } = useTranslations();
  const { selectedProject, selectProject, createProject, updateProject, isLoading, isSaving } =
    useProjectStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [alertConfig, setAlertConfig] = useState<Omit<ComponentProps<typeof AppAlert>, "onClose">>({
    visible: false,
    title: "",
    message: "",
    type: "alert",
    actions: [],
  });

  // Reset form when switching between create and edit mode
  useEffect(() => {
    if (!isEditMode) {
      // Create mode - reset form to initial state
      setFormData(initialFormData);
      setErrors({});
    }
  }, [id, isEditMode]);

  // Load project data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const numericId = parseInt(id, RADIX_DECIMAL);
      if (!isNaN(numericId)) {
        selectProject(numericId);
      }
    }
  }, [id, isEditMode, selectProject]);

  // Populate form when selectedProject changes (edit mode)
  useEffect(() => {
    if (isEditMode && selectedProject) {
      setFormData({
        zzz_name: selectedProject.zzz_name,
        zzz_default_language: selectedProject.zzz_default_language,
        zzz_supported_languages: selectedProject.zzz_supported_languages,
        zzz_cascade_timeout_minutes: selectedProject.zzz_cascade_timeout_minutes.toString(),
        zzz_max_cascade_attempts: selectedProject.zzz_max_cascade_attempts.toString(),
        zzz_is_active: selectedProject.zzz_is_active,
        zzz_timezone: selectedProject.zzz_timezone,
      });
    }
  }, [isEditMode, selectedProject]);

  // Map Zod field names to translation keys
  const fieldToTranslationKey: Record<string, string> = {
    zzz_name: "validation.name_required",
    zzz_supported_languages: "validation.supported_languages_required",
    zzz_cascade_timeout_minutes: "validation.timeout_range",
    zzz_max_cascade_attempts: "validation.attempts_range",
    zzz_timezone: "validation.timezone_required",
  };

  const validateForm = (): boolean => {
    const parsedData = {
      zzz_name: formData.zzz_name.trim(),
      zzz_default_language: formData.zzz_default_language,
      zzz_supported_languages: formData.zzz_supported_languages,
      zzz_cascade_timeout_minutes: Number(formData.zzz_cascade_timeout_minutes),
      zzz_max_cascade_attempts: Number(formData.zzz_max_cascade_attempts),
      zzz_is_active: formData.zzz_is_active,
      zzz_timezone: formData.zzz_timezone.trim(),
    };

    const schema = isEditMode ? UpdateProjectSchema : CreateProjectSchema;
    const result = schema.safeParse(parsedData);

    if (!result.success) {
      const newErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        const translationKey = fieldToTranslationKey[key];
        newErrors[key] = translationKey ? t(translationKey) : issue.message;
      }
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const projectData = {
      zzz_name: formData.zzz_name.trim(),
      zzz_default_language: formData.zzz_default_language,
      zzz_supported_languages: formData.zzz_supported_languages,
      zzz_cascade_timeout_minutes: parseInt(formData.zzz_cascade_timeout_minutes, RADIX_DECIMAL),
      zzz_max_cascade_attempts: parseInt(formData.zzz_max_cascade_attempts, RADIX_DECIMAL),
      zzz_is_active: formData.zzz_is_active,
      zzz_timezone: formData.zzz_timezone.trim(),
    };

    try {
      if (isEditMode && id) {
        const numericId = parseInt(id, RADIX_DECIMAL);
        await updateProject(numericId, projectData);
      } else {
        await createProject(projectData);
      }
      // Navigate to project list after save
      replace("/admin/project");
    } catch (e: unknown) {
      logger.error("Failed to save project", e, { isEditMode, formData });
      setAlertConfig({
        visible: true,
        title: t("error"),
        message: t("project_save_failed"),
        type: "alert",
        actions: [
          {
            text: t("ok"),
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleActive = (value: boolean) => {
    const title = value
      ? t("project.activate_confirm_title")
      : t("project.deactivate_confirm_title");
    const message = value
      ? t("project.activate_confirm_message")
      : t("project.deactivate_confirm_message");

    setAlertConfig({
      visible: true,
      title,
      message,
      type: "alert",
      actions: [
        {
          text: t("common.cancel"),
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: () => {
            updateField("zzz_is_active", value);
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          },
          variant: "primary",
        },
      ],
    });
  };

  const handleLanguageToggle = (lang: Language) => {
    setFormData((prev) => {
      const isSelected = prev.zzz_supported_languages.includes(lang);

      // Don't allow removing the last language
      if (isSelected && prev.zzz_supported_languages.length === 1) {
        return prev;
      }

      const newLanguages = isSelected
        ? prev.zzz_supported_languages.filter((l) => l !== lang)
        : [...prev.zzz_supported_languages, lang];

      // If removing the default language, switch to first remaining
      const newDefault =
        !newLanguages.includes(prev.zzz_default_language) && newLanguages.length > 0
          ? newLanguages[0]
          : prev.zzz_default_language;

      return {
        ...prev,
        zzz_supported_languages: newLanguages,
        zzz_default_language: newDefault,
      };
    });

    if (errors.zzz_supported_languages) {
      setErrors((prev) => ({ ...prev, zzz_supported_languages: undefined }));
    }
  };

  const handleDefaultLanguageChange = (lang: Language) => {
    if (formData.zzz_supported_languages.includes(lang)) {
      updateField("zzz_default_language", lang);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 w-full self-center max-w-sm pb-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-on-surface font-display">
              {isEditMode ? t("edit_project") : t("new_project")}
            </Text>
          </View>

          {/* Loading State */}
          {isEditMode && isLoading && <LoadingView fullScreen={false} className="py-12" />}

          {/* Form */}
          {!isEditMode || !isLoading ? (
            <View className="gap-4">
              {/* Name */}
              <FormInput
                testID="project-name-input"
                label={t("project_name")}
                value={formData.zzz_name}
                onChangeText={(value) => updateField("zzz_name", value)}
                error={errors.zzz_name}
                required
                placeholder={t("project_name_placeholder")}
              />

              {/* Supported Languages */}
              <FormLanguageSelector
                label={t("supported_languages")}
                selectedLanguages={formData.zzz_supported_languages}
                onToggle={handleLanguageToggle}
                availableLanguages={AVAILABLE_LANGUAGES}
                error={errors.zzz_supported_languages}
              />

              {/* Default Language (only show if has supported languages) */}
              {formData.zzz_supported_languages.length > 0 && (
                <View className="mb-3">
                  <Text className="text-sm font-medium text-on-surface mb-2">
                    {t("default_language")}
                  </Text>
                  <View className="flex-row gap-2">
                    {formData.zzz_supported_languages.map((lang) => (
                      <Button
                        key={lang}
                        variant="ghost"
                        testID={`default-language-${lang}`}
                        accessibilityLabel={`Select ${lang} as default language`}
                        className={`
                          px-5 py-3 min-h-touch rounded-none
                          ${formData.zzz_default_language === lang ? "bg-primary-container" : "bg-surface-container-highest"}
                        `}
                        onPress={() => handleDefaultLanguageChange(lang)}
                      >
                        <Text
                          className={`
                            text-base font-medium uppercase
                            ${formData.zzz_default_language === lang ? "text-on-primary" : "text-on-surface opacity-50"}
                          `}
                        >
                          {lang}
                        </Text>
                      </Button>
                    ))}
                  </View>
                </View>
              )}

              {/* Cascade Timeout */}
              <FormInput
                testID="cascade-timeout-input"
                label={t("cascade_timeout")}
                value={formData.zzz_cascade_timeout_minutes}
                onChangeText={(value) => updateField("zzz_cascade_timeout_minutes", value)}
                error={errors.zzz_cascade_timeout_minutes}
                keyboardType="number-pad"
                placeholder="30"
                helperText={t("cascade_timeout_helper")}
              />

              {/* Max Cascade Attempts */}
              <FormInput
                testID="max-attempts-input"
                label={t("max_attempts")}
                value={formData.zzz_max_cascade_attempts}
                onChangeText={(value) => updateField("zzz_max_cascade_attempts", value)}
                error={errors.zzz_max_cascade_attempts}
                keyboardType="number-pad"
                placeholder="10"
                helperText={t("max_attempts_helper")}
              />

              {/* Timezone */}
              <FormInput
                testID="project-timezone-input"
                label={t("project_timezone")}
                value={formData.zzz_timezone}
                onChangeText={(value) => updateField("zzz_timezone", value)}
                error={errors.zzz_timezone}
                required
                placeholder={t("project_timezone_placeholder")}
                helperText={t("project_timezone_helper")}
              />

              {/* Is Active */}
              <FormSwitch
                label={t("active")}
                value={formData.zzz_is_active}
                onValueChange={handleToggleActive}
                testID="project-active-switch"
                warning={t("project.deactivate_warning")}
                helperText={t("project.is_active_help")}
              />

              {/* Action Buttons */}
              <View className="pt-6 flex-row gap-4">
                <View className="flex-1">
                  <Button
                    title={t("cancel")}
                    variant="secondary"
                    onPress={() => back()}
                    testID="project-cancel-button"
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title={isEditMode ? t("save") : t("create")}
                    onPress={handleSubmit}
                    disabled={isSaving}
                    testID="project-submit-button"
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusBar style="auto" />
      <AppAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        actions={alertConfig.actions}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </Screen>
  );
}
