import { Image } from "react-native";
import type { ImageProps } from "react-native";

/**
 * Product image that fills its container with cover behavior.
 *
 * WHY WE USE `style` INSTEAD OF CLASSNAME:
 * react-native-web's <Image> component ignores NativeWind/Tailwind classes
 * for width, height, and object-fit when rendering on the web target.
 * After testing className="w-full h-full", className="absolute inset-0",
 * resizeMode="cover", and every other className-only approach, none of them
 * produce correct image sizing and stretching on web.
 *
 * The ONLY reliable approach is to set these three properties via the style
 * prop using a named module-level constant (not an inline literal).
 *
 * This is a listed exception in AGENTS.md under Styling (Utilities Only).
 */
const STYLE = { width: "100%", height: "100%", objectFit: "cover" } as const;

export const CatalogImage = (props: Omit<ImageProps, "style">) => (
  <Image {...props} style={STYLE} />
);

CatalogImage.displayName = "CatalogImage";
