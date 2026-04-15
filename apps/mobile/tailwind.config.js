import nativewindPreset from "nativewind/preset";
import { COLORS } from "@repo/shared";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        ...COLORS,
      },
      fontFamily: {
        // Section 3: Manrope for headlines, Inter for body
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      // Section 5: Sharp angular buttons (0 border-radius)
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
      // Section 6: Minimum touch targets (48x48dp minimum)
      minHeight: {
        button: "5.5rem", // 88px / 16 in tailwind scale
        touch: "3rem", // 48dp minimum
      },
      // Spacing scale (Section 6)
      spacing: {
        "scale-4": "1rem",
        "scale-6": "1.5rem",
        "scale-8": "2rem",
      },
      objectFit: {
        contain: "contain",
        cover: "cover",
        coverl: "cover",
      },
    },
  },
  plugins: [],
};
