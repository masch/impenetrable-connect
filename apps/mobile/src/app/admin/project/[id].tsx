import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useProjectStore } from "../../../stores/project.store";
import { useTranslations } from "../../../hooks/useI18n";
import { Language, SUPPORTED_LANGUAGES } from "@repo/shared";
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

interface FormData {
  zzz_name: string;
  zzz_default_language: Language;
  zzz_supported_languages: Language[];
  zzz_cascade_timeout_minutes: string;
  zzz_max_cascade_attempts: string;
  zzz_is_active: boolean;
}

interface FormErrors {
  zzz_name?: string;
  zzz_supported_languages?: string;
  zzz_cascade_timeout_minutes?: string;
  zzz_max_cascade_attempts?: string;
}

const initialFormData: FormData = {
  zzz_name: "",
  zzz_default_language: "es",
  zzz_supported_languages: ["es"],
  zzz_cascade_timeout_minutes: "30",
  zzz_max_cascade_attempts: "10",
  zzz_is_active: true,
};

export default function ProjectFormScreen() {
  const router = useRouter();
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
      const numericId = parseInt(id, 10);
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
      });
    }
  }, [isEditMode, selectedProject]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.zzz_name.trim()) {
      newErrors.zzz_name = t("validation.name_required");
    } else if (formData.zzz_name.trim().length < 2) {
      newErrors.zzz_name = t("validation.name_min_length");
    }

    if (formData.zzz_supported_languages.length === 0) {
      newErrors.zzz_supported_languages = t("validation.supported_languages_required");
    }

    const timeout = parseInt(formData.zzz_cascade_timeout_minutes, 10);
    if (isNaN(timeout) || timeout < 1 || timeout > 120) {
      newErrors.zzz_cascade_timeout_minutes = t("validation.timeout_range");
    }

    const attempts = parseInt(formData.zzz_max_cascade_attempts, 10);
    if (isNaN(attempts) || attempts < 1 || attempts > 10) {
      newErrors.zzz_max_cascade_attempts = t("validation.attempts_range");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const projectData = {
      zzz_name: formData.zzz_name.trim(),
      zzz_default_language: formData.zzz_default_language,
      zzz_supported_languages: formData.zzz_supported_languages,
      zzz_cascade_timeout_minutes: parseInt(formData.zzz_cascade_timeout_minutes, 10),
      zzz_max_cascade_attempts: parseInt(formData.zzz_max_cascade_attempts, 10),
      zzz_is_active: formData.zzz_is_active,
    };

    try {
      if (isEditMode && id) {
        const numericId = parseInt(id, 10);
        await updateProject(numericId, projectData);
      } else {
        await createProject(projectData);
      }
      // Navigate to project list after save
      router.replace("/admin/project");
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
                label={t("cascade_timeout")}
                value={formData.zzz_cascade_timeout_minutes}
                onChangeText={(value) => updateField("zzz_cascade_timeout_minutes", value)}
                error={errors.zzz_cascade_timeout_minutes}
                keyboardType="number-pad"
                placeholder="30"
                helperText="1-120 minutes"
              />

              {/* Max Cascade Attempts */}
              <FormInput
                label={t("max_attempts")}
                value={formData.zzz_max_cascade_attempts}
                onChangeText={(value) => updateField("zzz_max_cascade_attempts", value)}
                error={errors.zzz_max_cascade_attempts}
                keyboardType="number-pad"
                placeholder="10"
                helperText="1-10 attempts"
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
                  <Button title={t("cancel")} variant="secondary" onPress={() => router.back()} />
                </View>
                <View className="flex-1">
                  <Button
                    title={isEditMode ? t("save") : t("create")}
                    onPress={handleSubmit}
                    disabled={isSaving}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusBar style="auto" />
      <AppAlert
        {...alertConfig}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </Screen>
  );
}
