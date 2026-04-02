---
name: expo-tailwind-setup
description: >
  NativeWind v5 + TW v4 + react-native-css wrapper setup.
  Trigger: When styling mobile components or configuring UI elements.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Adding styles to views/text in React Native
- Setting up the UI infrastructure

## Critical Patterns

- Always use NativeWind utility classes (`className`) over StyleSheet.create().
- Do not use generic string classes; rely on standard Tailwind aliases.
- Follow the bold, modern UI guidelines (avoid generic colors).

## Code Examples

```tsx
import { View, Text } from "react-native";

export default function Card() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-zinc-900 rounded-2xl shadow-sm">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">Impenetrable Connect</Text>
    </View>
  );
}
```
