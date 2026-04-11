/**
 * SegmentedControl Component
 * A tab-like control for switching between options
 */

import { View, Text, Pressable } from "react-native";

interface SegmentedControlProps {
  segments: { label: string }[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View className="flex p-1 bg-surface-container-low rounded-xl">
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(index)}
            className={`flex-1 py-3 text-sm font-bold rounded-lg ${
              isSelected
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-tab-inactive hover:text-primary"
            }`}
          >
            <Text
              className={`text-sm font-bold text-center ${
                isSelected ? "text-primary" : "text-tab-inactive"
              }`}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
