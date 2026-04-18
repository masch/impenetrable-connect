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
  name: string;
  default_language: Language;
  supported_languages: Language[];
  cascade_timeout_minutes: string;
  max_cascade_attempts: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  supported_languages?: string;
  cascade_timeout_minutes?: string;
  max_cascade_attempts?: string;
}

const initialFormData: FormData = {
  name: "",
  default_language: "es",
  supported_languages: ["es"],
  cascade_timeout_minutes: "30",
  max_cascade_attempts: "10",
  is_active: true,
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
        name: selectedProject.name,
        default_language: selectedProject.default_language,
        supported_languages: selectedProject.supported_languages,
        cascade_timeout_minutes: selectedProject.cascade_timeout_minutes.toString(),
        max_cascade_attempts: selectedProject.max_cascade_attempts.toString(),
        is_active: selectedProject.is_active,
      });
    }
  }, [isEditMode, selectedProject]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.name_required");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("validation.name_min_length");
    }

    if (formData.supported_languages.length === 0) {
      newErrors.supported_languages = t("validation.supported_languages_required");
    }

    const timeout = parseInt(formData.cascade_timeout_minutes, 10);
    if (isNaN(timeout) || timeout < 1 || timeout > 120) {
      newErrors.cascade_timeout_minutes = t("validation.timeout_range");
    }

    const attempts = parseInt(formData.max_cascade_attempts, 10);
    if (isNaN(attempts) || attempts < 1 || attempts > 10) {
      newErrors.max_cascade_attempts = t("validation.attempts_range");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const projectData = {
      name: formData.name.trim(),
      default_language: formData.default_language,
      supported_languages: formData.supported_languages,
      cascade_timeout_minutes: parseInt(formData.cascade_timeout_minutes, 10),
      max_cascade_attempts: parseInt(formData.max_cascade_attempts, 10),
      is_active: formData.is_active,
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

  const handleLanguageToggle = (lang: Language) => {
    setFormData((prev) => {
      const isSelected = prev.supported_languages.includes(lang);

      // Don't allow removing the last language
      if (isSelected && prev.supported_languages.length === 1) {
        return prev;
      }

      const newLanguages = isSelected
        ? prev.supported_languages.filter((l) => l !== lang)
        : [...prev.supported_languages, lang];

      // If removing the default language, switch to first remaining
      const newDefault =
        !newLanguages.includes(prev.default_language) && newLanguages.length > 0
          ? newLanguages[0]
          : prev.default_language;

      return {
        ...prev,
        supported_languages: newLanguages,
        default_language: newDefault,
      };
    });

    if (errors.supported_languages) {
      setErrors((prev) => ({ ...prev, supported_languages: undefined }));
    }
  };

  const handleDefaultLanguageChange = (lang: Language) => {
    if (formData.supported_languages.includes(lang)) {
      updateField("default_language", lang);
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
                value={formData.name}
                onChangeText={(value) => updateField("name", value)}
                error={errors.name}
                required
                placeholder={t("project_name_placeholder")}
              />

              {/* Supported Languages */}
              <FormLanguageSelector
                label={t("supported_languages")}
                selectedLanguages={formData.supported_languages}
                onToggle={handleLanguageToggle}
                availableLanguages={AVAILABLE_LANGUAGES}
                error={errors.supported_languages}
              />

              {/* Default Language (only show if has supported languages) */}
              {formData.supported_languages.length > 0 && (
                <View className="mb-3">
                  <Text className="text-sm font-medium text-on-surface mb-2">
                    {t("default_language")}
                  </Text>
                  <View className="flex-row gap-2">
                    {formData.supported_languages.map((lang) => (
                      <View
                        key={lang}
                        className={`
                          px-5 py-3 min-h-touch cursor-pointer
                          ${formData.default_language === lang ? "bg-primary-container" : "bg-surface-container-highest"}
                        `}
                        onTouchEnd={() => handleDefaultLanguageChange(lang)}
                      >
                        <Text
                          className={`
                            text-base font-medium
                            ${formData.default_language === lang ? "text-on-primary" : "text-on-surface opacity-50"}
                          `}
                        >
                          {lang.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Cascade Timeout */}
              <FormInput
                label={t("cascade_timeout")}
                value={formData.cascade_timeout_minutes}
                onChangeText={(value) => updateField("cascade_timeout_minutes", value)}
                error={errors.cascade_timeout_minutes}
                keyboardType="number-pad"
                placeholder="30"
                helperText="1-120 minutes"
              />

              {/* Max Cascade Attempts */}
              <FormInput
                label={t("max_attempts")}
                value={formData.max_cascade_attempts}
                onChangeText={(value) => updateField("max_cascade_attempts", value)}
                error={errors.max_cascade_attempts}
                keyboardType="number-pad"
                placeholder="10"
                helperText="1-10 attempts"
              />

              {/* Is Active */}
              <FormSwitch
                label={t("active")}
                value={formData.is_active}
                onValueChange={(value) => updateField("is_active", value)}
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
