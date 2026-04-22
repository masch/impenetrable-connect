import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Screen from "../../components/Screen";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { useTranslations } from "../../hooks/useI18n";
import { useAuthStore } from "../../stores/auth.store";
import { CreateUserInput } from "@repo/shared";
import jaguarHero from "../../../assets/jaguar-hero.png";
import { logger } from "../../services/logger.service";

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
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    alias: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.alias.trim()) {
      newErrors.alias = t("login.alias_required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    const toNullable = (v: string | undefined) => (v ? v : null);
    const userData: CreateUserInput = {
      alias: formData.alias.trim(),
      firstName: toNullable(formData.firstName.trim()) || null,
      lastName: toNullable(formData.lastName.trim()) || null,
      phoneNumber: toNullable(formData.phoneNumber.trim()) || null,
      role: "TOURIST",
      email: null,
    };
    const register = useAuthStore.getState().register;
    register(userData)
      .then(() => {
        router.replace("/tourist");
      })
      .catch((error) => {
        logger.error("Registration failed", error);
      });
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Screen>
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
            <View className="relative w-full h-40 bg-surface-container-low">
              <Image
                source={jaguarHero}
                accessibilityLabel="Yaguareté in the Chaco"
                className="w-full h-full flex-1"
                contentFit="cover"
                transition={200}
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
          <Button title={t("login.submit_button")} onPress={handleSubmit} icon="→" />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
