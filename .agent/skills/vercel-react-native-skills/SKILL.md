---
name: vercel-react-native-skills
description: >
  38 RN best practices: FlashList, native navigators, Pressable, GPU animations.
  Trigger: When building deep React Native features or tuning performance.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Building lists, navigators, and interactive components
- Optimizing render cycles

## Critical Patterns

- Use `@shopify/flash-list` INSTEAD of FlatList/ScrollView for mapped items.
- Always prefer `Pressable` over `TouchableOpacity`.
- Avoid deeply nesting Views; keep DOM shallow.
- Use Reanimated for complex GPU-bound animations.

## Code Examples

```tsx
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text } from "react-native";

export function FastList({ data }) {
  return (
    <FlashList
      data={data}
      estimatedItemSize={50}
      renderItem={({ item }) => (
        <Pressable className="p-4 active:scale-95 transition-transform" onPress={() => {}}>
          <Text>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}
```
