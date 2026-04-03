import { useEffect } from "react";
import { Stack } from "expo-router";
import { DEFAULT_SCREEN_OPTIONS } from "../constants/nav.constants";
import { useLocale } from "../hooks/useI18n";
import "../../global.css";

function LocaleInitializer() {
  const { initializeLocale } = useLocale();

  useEffect(() => {
    initializeLocale();
  }, [initializeLocale]);

  return null;
}

export default function RootLayout() {
  return (
    <>
      <LocaleInitializer />
      <Stack screenOptions={DEFAULT_SCREEN_OPTIONS} />
    </>
  );
}
