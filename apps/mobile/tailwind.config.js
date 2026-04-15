import nativewindPreset from "nativewind/preset";
import colors from "../../packages/shared/src/theme/colors.json";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        ...colors,
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
        button: "5.5rem",
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
