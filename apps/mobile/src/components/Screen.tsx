import { ReactNode } from "react";
import { View, Text } from "react-native";

interface ScreenProps {
  title: string;
  children?: ReactNode;
}

export default function Screen({ title, children }: ScreenProps) {
  return (
    <View className="flex-1 bg-surface pt-20 px-5">
      <View className="flex-1 max-w-md w-full mx-auto">
        <Text className="text-2xl font-bold text-primary mb-6">{title}</Text>
        {children}
      </View>
    </View>
  );
}
