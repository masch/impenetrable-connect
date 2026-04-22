import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../stores/auth.store";
import { useTranslations } from "../../hooks/useI18n";
import Screen from "../../components/Screen";
import { FormInput } from "../../components/FormInput";
import { logger } from "../../services/logger.service";

// @ts-ignore - Jaguar image for the brand feel
import jaguarHero from "../../../assets/jaguar-hero.png";

export default function LoginScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const userRole = useAuthStore((state) => state.userRole);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login({ email, password });
      
      // Redirect based on role
      if (userRole === "ENTREPRENEUR") {
        router.replace("/entrepreneur/agenda");
      } else if (userRole === "ADMIN") {
        router.replace("/admin/project");
      } else {
        router.replace("/tourist");
      }
    } catch (e) {
      logger.error("Login failed", e);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="max-w-md mx-auto w-full">
            <View className="relative w-full h-48 bg-surface-container-low">
              <Image
                source={jaguarHero}
                accessibilityLabel="Yaguareté in the Chaco"
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 -mt-10 relative z-20">
              <View className="bg-surface-container-low p-6 rounded-t-3xl">
                <Text className="font-display font-extrabold text-3xl text-on-surface tracking-tight mb-2 text-center">
                  {t("common.login")}
                </Text>
                <Text className="text-on-surface-variant text-center mb-8 font-body">
                  {userRole === "ADMIN" ? t("login.admin_portal") : t("login.entrepreneur_panel")}
                </Text>

                {error && (
                  <View className="bg-error-container p-4 mb-6 rounded-2xl border border-error/20">
                    <Text className="text-on-error-container text-sm font-body text-center">
                      {error ? t(error) : ""}
                    </Text>
                  </View>
                )}

                <View className="gap-5">
                  <FormInput
                    label={t("login.email_label")}
                    placeholder="ejemplo@rewilding.com"
                    value={email}
                    onChangeText={(val: string) => {
                      setEmail(val);
                      if (error) clearError();
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />

                  <FormInput
                    label={t("login.password_label")}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(val: string) => {
                      setPassword(val);
                      if (error) clearError();
                    }}
                    secureTextEntry
                  />

                  <Button
                    title={t("common.login")}
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="mt-4"
                  />

                  <Button
                    title={t("common.back")}
                    variant="ghost"
                    onPress={() => router.back()}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
