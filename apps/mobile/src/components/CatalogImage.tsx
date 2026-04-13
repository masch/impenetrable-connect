/**
 * CatalogImage Component
 * Reusable image component for catalog items - handles both URLs and local assets
 * with platform-specific objectFit (contain on web, cover on native)
 */

import { Image, Platform, View } from "react-native";
import type { ImageRequireSource } from "react-native";

interface CatalogImageProps {
  imageUrl?: string | ImageRequireSource | null;
  alt: string;
  className?: string;
  style?: object;
}

export function CatalogImage({
  imageUrl,
  alt,
  className = "w-full h-full",
  style,
}: CatalogImageProps) {
  if (!imageUrl) return null;

  const isRemoteUrl = typeof imageUrl === "string" && imageUrl.startsWith("http");
  const objectFit = Platform.OS === "web" ? "contain" : "cover";

  return (
    <View className={className}>
      {isRemoteUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[{ width: "100%", height: "100%", objectFit }, style]}
          accessibilityLabel={alt}
        />
      ) : (
        <Image
          source={imageUrl as ImageRequireSource}
          style={[{ width: "100%", height: "100%", objectFit }, style]}
          accessibilityLabel={alt}
        />
      )}
    </View>
  );
}
