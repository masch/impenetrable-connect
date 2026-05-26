import { useState, useTransition } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Screen from "../../components/Screen";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { Icon } from "../../components/Icon";
import LoadingView from "../../components/LoadingView";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";
import { COLORS, CreateUserInput, UserRole } from "@repo/shared";
import jaguarHero from "../../../assets/jaguar-hero.png";

const IMAGE_TRANSITION_DURATION = 200;
const ICON_SIZE_ALERT = 20;

const toNullable = (v: string | undefined): string | null => (v ? v : null);

interface LoginFormData {
  alias: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  alias?: string;
}

export default function LoginScreen() {
  const { t } = useTranslations();
  const { replace } = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    alias: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.alias.trim()) {
      newErrors.alias = t("login.alias_required");
    }
    setErrors(newErrors);
    setSubmissionError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || isPending) {
      return;
    }
    setSubmissionError(null);
    const userData: CreateUserInput = {
      alias: formData.alias.trim(),
      firstName: toNullable(formData.firstName.trim()),
      lastName: toNullable(formData.lastName.trim()),
      phoneNumber: toNullable(formData.phoneNumber.trim()),
      role: UserRole.TOURIST,
      email: null,
    };
    const register = useAuthStore.getState().register;
    startTransition(async () => {
      try {
        await register(userData);
        replace("/tourist");
      } catch {
        setSubmissionError(t("login.errors.registration_failed"));
      }
    });
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear submission error when user starts typing again
    if (submissionError) {
      setSubmissionError(null);
    }
  };

  return (
    <Screen>
      {isPending && <LoadingView />}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 flex-grow-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="max-w-md mx-auto w-full">
            <View className="relative w-full h-40 bg-surface-container-low overflow-hidden">
              <Image
                source={jaguarHero}
                accessibilityLabel="Yaguareté in the Chaco"
                className="w-full h-full flex-1"
                contentFit="cover"
                transition={IMAGE_TRANSITION_DURATION}
              />
            </View>

            <View className="flex-1 -mt-10 relative z-20">
              <View className="bg-surface-container-low p-6">
                <Text className="font-display font-extrabold text-3xl text-on-surface tracking-tight leading-none mb-3 text-center">
                  {t("login.welcome_title")}
                </Text>
                <Text className="text-on-surface-variant font-body text-base leading-relaxed mb-6">
                  {t("login.welcome_subtitle")}
                </Text>

                <View className="space-y-4">
                  <FormInput
                    label={t("login.alias_label")}
                    placeholder={t("login.alias_placeholder")}
                    value={formData.alias}
                    onChangeText={(value) => updateField("alias", value)}
                    required
                    error={errors.alias}
                  />

                  <View className="pt-2 space-y-3">
                    <View className="flex items-center gap-2 mb-1">
                      <View className="h-px flex-1 bg-outline-variant/30" />
                      <Text className="text-[10px] font-body font-black uppercase text-on-surface-variant tracking-widest px-2">
                        {t("login.optional_section")}
                      </Text>
                      <View className="h-px flex-1 bg-outline-variant/30" />
                    </View>

                    <FormInput
                      label={t("login.whatsapp_label")}
                      placeholder={t("login.whatsapp_placeholder")}
                      keyboardType="phone-pad"
                      value={formData.phoneNumber}
                      onChangeText={(value) => updateField("phoneNumber", value)}
                    />
                    <View className="grid grid-cols-2 gap-3">
                      <FormInput
                        label={t("login.first_name_label")}
                        value={formData.firstName}
                        onChangeText={(value) => updateField("firstName", value)}
                      />
                      <FormInput
                        label={t("login.last_name_label")}
                        value={formData.lastName}
                        onChangeText={(value) => updateField("lastName", value)}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View className="h-24" />
            </View>
          </View>
        </ScrollView>

        <View className="p-5 bg-surface/85 backdrop-blur-sm max-w-md mx-auto w-full">
          {submissionError && (
            <View
              className="flex-row items-center gap-2 mb-3 px-4 py-3 rounded-xl bg-error-container border border-error/20"
              accessibilityRole="alert"
              accessibilityLabel={submissionError}
              testID="registration-error"
            >
              <Icon name="alert-circle" size={ICON_SIZE_ALERT} color={COLORS.error} />
              <Text className="text-sm font-body text-error flex-1">{submissionError}</Text>
            </View>
          )}
          <Button
            title={t("login.submit_button")}
            onPress={handleSubmit}
            icon="→"
            testID="login-submit"
            accessibilityLabel={t("login.submit_button")}
            accessibilityHint={t("accessibility.login_submit_hint")}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
