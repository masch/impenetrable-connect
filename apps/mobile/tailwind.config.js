import nativewindPreset from "nativewind/preset";
// REVERT: Using relative path because Tailwind/Nativewind compiler (Node/Jiti)
// cannot resolve workspace aliases during build-time.
import { COLORS } from "../../packages/shared/src/theme/colors.data.js";

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
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
      minHeight: {
        button: "3.5rem",
        touch: "3rem",
      },
      spacing: {
        "scale-4": "1rem",
        "scale-6": "1.5rem",
        "scale-8": "2rem",
      },
      objectFit: {
        contain: "contain",
        cover: "cover",
      },
    },
  },
  plugins: [],
};
